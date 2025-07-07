-- Back-fill any auth.users that do not yet have a row in public.user_profiles
insert into public.user_profiles (id, full_name)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', u.email, 'Unnamed')
from auth.users u
left join public.user_profiles p on p.id = u.id
where p.id is null;
