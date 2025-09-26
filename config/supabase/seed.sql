-- Seed data for development and default smart spaces

-- Function to create default smart spaces for new users
CREATE OR REPLACE FUNCTION create_default_smart_spaces_for_user(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create default smart spaces
  INSERT INTO public.smart_spaces (user_id, name, description, icon, rules, is_default) VALUES
    (user_uuid, 'Recent', 'Recently added items', 'clock', '{
      "conditions": [],
      "logic": "AND"
    }'::jsonb, true),

    (user_uuid, 'Images', 'All your images and screenshots', 'image', '{
      "conditions": [
        {"field": "type", "operator": "equals", "value": "image"}
      ],
      "logic": "AND"
    }'::jsonb, true),

    (user_uuid, 'Articles', 'Web articles and blog posts', 'document', '{
      "conditions": [
        {"field": "type", "operator": "equals", "value": "article"}
      ],
      "logic": "AND"
    }'::jsonb, true),

    (user_uuid, 'Notes', 'Personal notes and thoughts', 'note', '{
      "conditions": [
        {"field": "type", "operator": "equals", "value": "note"}
      ],
      "logic": "AND"
    }'::jsonb, true),

    (user_uuid, 'Favorites', 'Your starred content', 'star', '{
      "conditions": [],
      "logic": "AND"
    }'::jsonb, true),

    (user_uuid, 'Work', 'Work-related content', 'briefcase', '{
      "conditions": [
        {"field": "ai_category", "operator": "equals", "value": "Work & Productivity"}
      ],
      "logic": "AND"
    }'::jsonb, false),

    (user_uuid, 'Learning', 'Educational content and resources', 'book', '{
      "conditions": [
        {"field": "ai_category", "operator": "equals", "value": "Learning & Education"}
      ],
      "logic": "AND"
    }'::jsonb, false);
END;
$$;

-- Trigger to create default smart spaces for new users
CREATE OR REPLACE FUNCTION create_profile_and_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default smart spaces
  PERFORM create_default_smart_spaces_for_user(NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_and_defaults();

-- Note: Sample data removed for production deployment
-- The application will create appropriate welcome content when users sign up