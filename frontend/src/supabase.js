import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zmffbrmlwdllljrqxtuw.supabase.co'
const supabaseKey = 'sb_publishable_FFShDZc8vB4GgLwWE2K6Ig_yar791ad'

export const supabase = createClient(supabaseUrl, supabaseKey)
