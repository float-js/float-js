/**
 * Float.js AI API Route Example
 * 
 * This demonstrates the native AI integration that sets Float.js apart.
 * No external plugins needed - AI is built into the framework!
 */

import { ai, streamResponse, sseResponse } from '@float/core';

// Simple chat endpoint
export async function POST(request: Request) {
  try {
    const { prompt, stream = false } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Streaming response (recommended for better UX)
    if (stream) {
      const streamGenerator = ai.stream(prompt, {
        systemPrompt: 'You are a helpful assistant powered by Float.js AI.',
        temperature: 0.7,
      });
      
      return streamResponse(streamGenerator);
    }

    // Regular response
    const response = await ai.chat(prompt, {
      systemPrompt: 'You are a helpful assistant powered by Float.js AI.',
      temperature: 0.7,
    });

    return new Response(
      JSON.stringify({ 
        message: response.content,
        model: response.model,
        usage: response.usage,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'AI request failed' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET endpoint for SSE-based streaming (useful for EventSource)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt');

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: 'Prompt query parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const streamGenerator = ai.stream(prompt, {
      systemPrompt: 'You are a helpful assistant powered by Float.js AI.',
    });

    return sseResponse(streamGenerator);
  } catch (error) {
    console.error('AI SSE Error:', error);
    return new Response(
      JSON.stringify({ error: 'SSE stream failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
