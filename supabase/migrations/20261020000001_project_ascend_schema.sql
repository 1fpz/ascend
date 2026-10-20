-- ==============================================================================
-- PROJECT ASCEND — SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Deterministic Gamified Personal Evolution SaaS (Zero AI Dependencies)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    life_vision TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and edit own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- 3. Character Profiles (RPG Gamification Stats)
CREATE TABLE IF NOT EXISTS public.character_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    discipline INTEGER NOT NULL DEFAULT 10,
    knowledge INTEGER NOT NULL DEFAULT 10,
    health INTEGER NOT NULL DEFAULT 10,
    execution INTEGER NOT NULL DEFAULT 10,
    consistency INTEGER NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own character profile"
    ON public.character_profiles FOR ALL
    USING (auth.uid() = user_id);

-- 4. Life Areas
CREATE TABLE IF NOT EXISTS public.life_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'Target',
    color TEXT NOT NULL DEFAULT '#6366f1',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own life areas"
    ON public.life_areas FOR ALL
    USING (auth.uid() = user_id);

-- 5. Primary Missions
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.life_areas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    purpose TEXT,
    success_criteria TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'archived', 'paused')) DEFAULT 'in_progress',
    calculated_progress INTEGER NOT NULL DEFAULT 0 CHECK (calculated_progress >= 0 AND calculated_progress <= 100),
    icon TEXT DEFAULT 'Shield',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own missions"
    ON public.missions FOR ALL
    USING (auth.uid() = user_id);

-- 6. Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    parent_submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')) DEFAULT 'pending',
    calculated_progress INTEGER NOT NULL DEFAULT 0 CHECK (calculated_progress >= 0 AND calculated_progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own submissions"
    ON public.submissions FOR ALL
    USING (auth.uid() = user_id);

-- 7. Submission Dependencies (Prevents cycles via domain logic & constraints)
CREATE TABLE IF NOT EXISTS public.submission_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    depends_on_submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT no_self_dep_submission CHECK (submission_id <> depends_on_submission_id),
    CONSTRAINT unique_sub_dep UNIQUE (submission_id, depends_on_submission_id)
);

ALTER TABLE public.submission_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own submission dependencies"
    ON public.submission_dependencies FOR ALL
    USING (auth.uid() = user_id);

-- 8. Tasks (Smart Task Engine Core)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL CHECK (task_type IN (
        'simple', 'reading', 'bible_reading', 'study', 'habit',
        'workout', 'meditation', 'numeric_goal', 'timed', 'checklist', 'evidence'
    )) DEFAULT 'simple',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')) DEFAULT 'medium',
    estimated_minutes INTEGER NOT NULL DEFAULT 30,
    due_date DATE,
    scheduled_date DATE,
    is_side_task BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'archived')) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks"
    ON public.tasks FOR ALL
    USING (auth.uid() = user_id);

-- 9. Task Dependencies
CREATE TABLE IF NOT EXISTS public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT no_self_dep_task CHECK (task_id <> depends_on_task_id),
    CONSTRAINT unique_task_dep UNIQUE (task_id, depends_on_task_id)
);

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own task dependencies"
    ON public.task_dependencies FOR ALL
    USING (auth.uid() = user_id);

-- 10. Daily Rituals / Habits
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.life_areas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'specific_days', 'weekly_count', 'monthly_count')) DEFAULT 'daily',
    frequency_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    target_count INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own habits"
    ON public.habits FOR ALL
    USING (auth.uid() = user_id);

-- 11. Habit Logs (Independent occurrences to prevent duplicate counts)
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    count INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_habit_date UNIQUE (habit_id, log_date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own habit logs"
    ON public.habit_logs FOR ALL
    USING (auth.uid() = user_id);

-- 12. XP Ledger (Idempotent audit record of points awarded/revoked)
CREATE TABLE IF NOT EXISTS public.xp_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('task_completion', 'habit_completion', 'mission_completion', 'achievement', 'admin_adjustment', 'task_reopened')),
    source_id UUID NOT NULL,
    xp_amount INTEGER NOT NULL,
    attribute TEXT NOT NULL CHECK (attribute IN ('discipline', 'knowledge', 'health', 'execution', 'consistency')),
    reason TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp ledger"
    ON public.xp_ledger FOR SELECT
    USING (auth.uid() = user_id);

-- 13. Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Trophy',
    category TEXT NOT NULL CHECK (category IN ('discipline', 'knowledge', 'health', 'execution', 'consistency', 'milestone')),
    xp_reward INTEGER NOT NULL DEFAULT 100,
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Public read for achievements definitions
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view achievements list"
    ON public.achievements FOR SELECT
    TO authenticated
    USING (true);

-- 14. User Achievements Unlocks
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unlocked achievements"
    ON public.user_achievements FOR ALL
    USING (auth.uid() = user_id);

-- 15. Smart Task Modules: Focus Sessions (Pomodoro / Study)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own focus sessions"
    ON public.focus_sessions FOR ALL
    USING (auth.uid() = user_id);

-- 16. Smart Task Modules: Bible Reading Logs
CREATE TABLE IF NOT EXISTS public.bible_reading_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verses_read TEXT NOT NULL,
    translation TEXT NOT NULL DEFAULT 'almeida',
    reflection TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bible_reading_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bible reading logs"
    ON public.bible_reading_logs FOR ALL
    USING (auth.uid() = user_id);

-- 17. Smart Task Modules: Workout Sessions
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workout sessions"
    ON public.workout_sessions FOR ALL
    USING (auth.uid() = user_id);

-- 18. Mission Templates (Library tracks for cloning)
CREATE TABLE IF NOT EXISTS public.mission_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
    estimated_duration_days INTEGER NOT NULL DEFAULT 30,
    structure JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mission_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view templates"
    ON public.mission_templates FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- 19. Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_tasks_user_scheduled ON public.tasks(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_mission_id ON public.tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_tasks_submission_id ON public.tasks(submission_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON public.xp_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_mission ON public.submissions(mission_id);
