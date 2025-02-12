create function public.handle_new_supabase_user()
  returns trigger as $$
  begin
    insert into public.users (id, name, email, image)
    values (
      new.id,
      COALESCE(
        new.raw_user_meta_data ->> 'name',
        new.raw_user_meta_data ->> 'givenName',
        new.raw_user_meta_data ->> 'familyName',
        'Visitante'
      ),
      new.email,
      new.raw_user_meta_data ->> 'photo'
    )
    on conflict (id) do update set
      name = excluded.name,
      image = excluded.image,
      email = excluded.email;
    return new;
  end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_supabase_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_supabase_user();
