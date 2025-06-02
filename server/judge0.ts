import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JUDGE0_API_KEY || !process.env.JUDGE0_HOST) {
  throw new Error('Missing required environment variables: JUDGE0_API_KEY and JUDGE0_HOST');
}

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST;

interface SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
}

interface SubmissionResponse {
  token: string;
}

interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
}

export const submitCode = async (code: string, languageId: number, input?: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions',
      {
        source_code: code,
        language_id: languageId,
        stdin: input || '',
      },
      {
        headers: {
          'x-rapidapi-key': JUDGE0_API_KEY,
          'x-rapidapi-host': JUDGE0_HOST,
          'content-type': 'application/json',
        },
      }
    );

    return response.data.token;
  } catch (error) {
    console.error('Error submitting code:', error);
    throw new Error('Failed to submit code to Judge0');
  }
};

export const getSubmissionResult = async (token: string): Promise<SubmissionResult> => {
  try {
    const response = await axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`,
      {
        headers: {
          'x-rapidapi-key': JUDGE0_API_KEY,
          'x-rapidapi-host': JUDGE0_HOST,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting submission result:', error);
    throw new Error('Failed to get submission result from Judge0');
  }
};

export const languageIds = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
}; 