import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const settings = JSON.parse(formData.get('settings') as string)

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user ID from the authorization header
    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Upload original file to storage
    const timestamp = new Date().getTime()
    const filePath = `processed/${timestamp}_${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Store the track information with user_id
    const { data: trackData, error: trackError } = await supabase
      .from('audio_tracks')
      .insert({
        file_path: filePath,
        title: file.name,
        eq_settings: settings.eq,
        comp_settings: settings.comp,
        user_id: user.id // Set the user_id from the authenticated user
      })
      .select()
      .single()

    if (trackError) throw trackError

    return new Response(
      JSON.stringify({
        message: 'Audio processed successfully',
        file: uploadData,
        track: trackData
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Process audio error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})