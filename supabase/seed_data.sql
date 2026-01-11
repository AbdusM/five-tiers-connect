-- "Omni-Seed" Script: Populates Data for ALL Users
-- ensures comprehensive data visibility for any logged-in user.

-- 1. UPDATE SCHEMA (Idempotent)
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_type_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_type_check 
  CHECK (type IN ('barbershop', 'salon', 'Legal', 'Employment', 'Health', 'Housing', 'Education'));

-- 2. SEED PARTNERS (Idempotent)
INSERT INTO businesses (name, type, address, city, zip, phone, is_active, is_youth_friendly, hours)
SELECT 'Community Legal Services', 'Legal', '1424 Chestnut St', 'Philadelphia', '19102', '215-981-3700', true, true, '{"mon": "9-5"}'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Community Legal Services');

INSERT INTO businesses (name, type, address, city, zip, phone, is_active, is_youth_friendly, hours)
SELECT 'Tech Impact Training', 'Education', '417 N 8th St', 'Philadelphia', '19123', '215-555-0400', true, true, '{"mon": "9-5"}'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Tech Impact Training');

INSERT INTO businesses (name, type, address, city, zip, phone, is_active, is_youth_friendly, hours)
SELECT 'Housing First Initiative', 'Housing', '2000 Hamilton St', 'Philadelphia', '19130', '215-555-0600', true, true, '{"mon": "9-5"}'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Housing First Initiative');

INSERT INTO businesses (name, type, address, city, zip, phone, is_active, is_youth_friendly, hours)
SELECT 'Vybe Urgent Care', 'Health', '1500 Spring Garden St', 'Philadelphia', '19130', '215-555-0500', true, true, '{"mon": "8-8"}'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Vybe Urgent Care');

INSERT INTO businesses (name, type, address, city, zip, phone, is_active, is_youth_friendly, hours)
SELECT 'Second Chance Employment', 'Employment', '123 Broad St', 'Philadelphia', '19109', '215-555-0300', true, true, '{"mon": "9-5"}'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Second Chance Employment');

INSERT INTO businesses (name, type, address, city, zip, phone, is_active, is_youth_friendly, hours)
SELECT 'Fade Masters Deluxe', 'barbershop', '4502 Chestnut St', 'Philadelphia', '19139', '215-555-0199', true, true, '{"mon": "10-7"}'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Fade Masters Deluxe');


-- 3. MASS DISTRIBUTION: Give Vouchers/Appointments to ALL Users
DO $$
DECLARE
    r_user RECORD;
    legal_id UUID;
    tech_id UUID;
    housing_id UUID;
    health_id UUID;
    empl_id UUID;
    fade_id UUID;
    v_new_id UUID;
BEGIN
    -- Get Business IDs
    SELECT id INTO legal_id FROM businesses WHERE name = 'Community Legal Services' LIMIT 1;
    SELECT id INTO tech_id FROM businesses WHERE name = 'Tech Impact Training' LIMIT 1;
    SELECT id INTO housing_id FROM businesses WHERE name = 'Housing First Initiative' LIMIT 1;
    SELECT id INTO health_id FROM businesses WHERE name = 'Vybe Urgent Care' LIMIT 1;
    SELECT id INTO empl_id FROM businesses WHERE name = 'Second Chance Employment' LIMIT 1;
    SELECT id INTO fade_id FROM businesses WHERE name = 'Fade Masters Deluxe' LIMIT 1;

    -- Loop through ALL users
    FOR r_user IN SELECT id FROM users
    LOOP
        -- A. VOUCHERS (If missing)
        -- 1. Legal
        IF NOT EXISTS (SELECT 1 FROM vouchers WHERE cohort_member_id = r_user.id AND business_id = legal_id) THEN
            INSERT INTO vouchers (cohort_member_id, business_id, amount, status, expires_at)
            VALUES (r_user.id, legal_id, 150.00, 'active', NOW() + INTERVAL '60 days')
            RETURNING id INTO v_new_id;
            
            -- Legal Appointment
            INSERT INTO appointments (user_id, business_id, scheduled_date, scheduled_time, status, service_type, notes, voucher_id)
            VALUES (r_user.id, legal_id, (CURRENT_DATE + INTERVAL '5 days'), '10:00:00', 'confirmed', 'Expungement Consultation', 'Omni-seeded appointment.', v_new_id);
        END IF;

        -- 2. Tech
        IF NOT EXISTS (SELECT 1 FROM vouchers WHERE cohort_member_id = r_user.id AND business_id = tech_id) THEN
            INSERT INTO vouchers (cohort_member_id, business_id, amount, status, expires_at)
            VALUES (r_user.id, tech_id, 500.00, 'active', NOW() + INTERVAL '90 days');
        END IF;

        -- 3. Housing (Utility Support)
        IF NOT EXISTS (SELECT 1 FROM vouchers WHERE cohort_member_id = r_user.id AND business_id = housing_id) THEN
            INSERT INTO vouchers (cohort_member_id, business_id, amount, status, expires_at)
            VALUES (r_user.id, housing_id, 200.00, 'active', NOW() + INTERVAL '30 days');
        END IF;

        -- 4. Health (Copay)
        IF NOT EXISTS (SELECT 1 FROM vouchers WHERE cohort_member_id = r_user.id AND business_id = health_id) THEN
            INSERT INTO vouchers (cohort_member_id, business_id, amount, status, expires_at)
            VALUES (r_user.id, health_id, 50.00, 'active', NOW() + INTERVAL '45 days');
        END IF;
        
        -- 5. Employment (Work Gear)
        IF NOT EXISTS (SELECT 1 FROM vouchers WHERE cohort_member_id = r_user.id AND business_id = empl_id) THEN
            INSERT INTO vouchers (cohort_member_id, business_id, amount, status, expires_at)
            VALUES (r_user.id, empl_id, 75.00, 'active', NOW() + INTERVAL '60 days');
        END IF;

        -- 6. Haircut
        IF NOT EXISTS (SELECT 1 FROM vouchers WHERE cohort_member_id = r_user.id AND business_id = fade_id) THEN
             INSERT INTO vouchers (cohort_member_id, business_id, amount, status, expires_at)
             VALUES (r_user.id, fade_id, 35.00, 'active', NOW() + INTERVAL '30 days');
        END IF;
        
        -- Appointment: Vybe Checkup (Future)
        INSERT INTO appointments (user_id, business_id, scheduled_date, scheduled_time, status, service_type, notes)
        SELECT r_user.id, health_id, (CURRENT_DATE + INTERVAL '14 days'), '09:15:00', 'confirmed', 'Annual Wellness Check', 'Added by Omni-Seed'
        WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE user_id = r_user.id AND business_id = health_id AND service_type = 'Annual Wellness Check');

    END LOOP;
END $$;
