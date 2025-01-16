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
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the session from the request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user's session
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      console.error('User verification error:', userError)
      throw new Error('Invalid user token')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const settings = JSON.parse(formData.get('settings') as string)

    // Upload original file to storage
    const timestamp = new Date().getTime()
    const filePath = `processed/${user.id}/${timestamp}_${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Store the track information
    const { data: trackData, error: trackError } = await supabase
      .from('audio_tracks')
      .insert({
        user_id: user.id,
        title: file.name,
        file_path: filePath,
        eq_settings: settings.eq,
        comp_settings: settings.comp
      })
      .select()
      .single()

    if (trackError) {
      console.error('Track creation error:', trackError)
      throw trackError
    }

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