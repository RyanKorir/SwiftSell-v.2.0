import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elqjyjyyvtzumzxsfugx.supabase.co';
const supabasePublishableKey = 'sb_publishable_J4um6aSoAvVgYUjD0S-QJQ_5y1kpJqf';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
