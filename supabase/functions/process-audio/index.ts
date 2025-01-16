import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('file')
    const settings = formData.get('settings')

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = audioFile.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = fileName.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    // Upload the original file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, audioFile, {
        contentType: audioFile.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Create audio track record
    const { data: trackData, error: trackError } = await supabase
      .from('audio_tracks')
      .insert({
        title: fileName,
        file_path: filePath,
        eq_settings: settings ? JSON.parse(settings).eq : null,
        comp_settings: settings ? JSON.parse(settings).comp : null,
      })
      .select()
      .single()

    if (trackError) {
      console.error('Track creation error:', trackError)
      return new Response(
        JSON.stringify({ error: 'Failed to create track record', details: trackError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Audio file processed successfully',
        track: trackData,
        file: uploadData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})