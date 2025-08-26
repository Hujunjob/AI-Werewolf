import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ApiResponse } from '@/lib/types';

async function handleProxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const targetPort = searchParams.get('port');
    
    if (!targetPort) {
      const response: ApiResponse = {
        success: false,
        error: 'Target port is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const pathSegments = params.path;
    const targetPath = pathSegments.join('/');
    const targetUrl = `http://localhost:${targetPort}/${targetPath}`;

    // Forward query parameters (except port)
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'port') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    const fullTargetUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // Prepare request options
    const requestOptions: any = {
      method: request.method,
      url: fullTargetUrl,
      timeout: 10000,
      validateStatus: () => true // Don't throw on HTTP errors
    };

    // Forward headers (except host)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['host', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    requestOptions.headers = headers;

    // Forward body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.data = body;
        }
      } catch (error) {
        // No body or invalid body, continue without it
      }
    }

    // Make the proxy request
    const response = await axios(requestOptions);

    // Forward the response
    return new NextResponse(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      }
    });

  } catch (error) {
    console.error('Proxy request failed:', error);
    
    let errorMessage = 'Proxy request failed';
    let status = 500;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        const { searchParams: urlSearchParams } = new URL(request.url);
        errorMessage = `Target server on port ${urlSearchParams.get('port')} is not running`;
        status = 503;
      } else if (error.response) {
        return new NextResponse(JSON.stringify(error.response.data), {
          status: error.response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          }
        });
      }
    }

    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };
    return NextResponse.json(response, { status });
  }
}

export const GET = handleProxyRequest;
export const POST = handleProxyRequest;
export const PUT = handleProxyRequest;
export const DELETE = handleProxyRequest;
export const PATCH = handleProxyRequest;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    }
  });
}