import {v1p1beta1} from '@google-cloud/speech';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import multer from 'multer';
import path from 'path';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({storage});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'google-service-account.json');

export namespace Google {
  export type IRecognizeRequest = Parameters<v1p1beta1.SpeechClient['recognize']>[0];
  export type IDuration = {
    seconds?: number | Long | string | null;
    nanos?: number | null;
  };
  export type IWordInfo = {
    startTime?: IDuration | null;
    endTime?: IDuration | null;
    word?: string | null;
    confidence?: number | null;
    speakerTag?: number | null;
  };
  export type ISpeechRecognitionAlternative = {
    transcript?: string | null;
    confidence?: number | null;
    words?: IWordInfo[] | null;
  };
  export type ISpeechRecognitionResult = {
    alternatives?: ISpeechRecognitionAlternative[] | null;
    channelTag?: number | null;
    resultEndTime?: IDuration | null;
    languageCode?: string | null;
  };
  export type ISpeechAdaptationInfo = {
    adaptationTimeout?: boolean | null;
    timeoutMessage?: string | null;
  };
  export type IRecognizeResponse = {
    results?: ISpeechRecognitionResult[] | null;
    totalBilledTime?: IDuration | null;
    speechAdaptationInfo?: ISpeechAdaptationInfo | null;
    requestId?: number | Long | string | null;
  };
  export type IRecognizeResult = [IRecognizeResponse, IRecognizeRequest | undefined, {} | undefined];
}

const config: Google.IRecognizeRequest['config'] = {
  encoding: 'MP3',
  sampleRateHertz: 16000,
  languageCode: 'pt-BR',
  diarizationConfig: {
    enableSpeakerDiarization: true,
    minSpeakerCount: 1,
    maxSpeakerCount: 4,
  },
};

const client = new v1p1beta1.SpeechClient({keyFilename: SERVICE_ACCOUNT_PATH});

const parseError = ({code, details, message, note}: any) => ({
  code,
  details,
  message,
  note,
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const audio = {content: req.file?.buffer.toString('base64')};
  try {
    const [response]: Google.IRecognizeResult = await client.recognize({config, audio});
    res.json(response);
  } catch (e) {
    res.status(400).json(parseError(e));
  }
});

app.post('/uri', async (req, res) => {
  const audio: Google.IRecognizeRequest['audio'] = {uri: req.body.uri};
  try {
    const [response]: Google.IRecognizeResult = await client.recognize({config, audio});
    res.json(response);
  } catch (e) {
    res.status(400).json(parseError(e));
  }
});

const {PORT = 3001} = process.env;

app.listen(PORT, () => console.log(`running on ${PORT}`));
