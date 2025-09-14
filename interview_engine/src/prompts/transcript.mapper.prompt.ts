import { TranscriptMessage } from "../types/evaluation.types";
import { Questions } from "../types/interview.types";

export interface TranscriptQA{
  question: string;
  candidateAnswer: string | null;
}


export function generateMappingPrompt(transcript : TranscriptMessage[], quesArray: Questions[]): string {


  return `System / Instruction:
    You are a precise extractor that converts a chat transcript into a QA array. Input contains two JSON values:
      1) "transcript": an ordered array of message objects { role: "assistant"|"user", text: string } (the transcript export).
      2) "questions": an array of objects { question: string } — this is the set of questions that should appear in the output in the same order.

    Task:
    For each object in "questions", find the candidate's answer in the transcript and produce an array of objects matching this interface:

      export interface IQuestionAnswer {
        question: string;
        candidateAnswer: string | null;
      }

    Rules (be strict and deterministic):
    1. Identify where a question appears in the transcript:

    2. Aggregate the candidate's answer:

    3. If a question cannot be matched to any assistant message in the transcript:
      - Attempt a fallback: look for user messages containing keywords from the question; if you find user messages that likely answer, aggregate them and set as candidateAnswer.
      - If fallback fails, \`candidateAnswer\` = null.

    4. Keep \`question\` text exactly as provided in the "questions" input.
    6. Output **only valid JSON**: an array of \`IQuestionAnswer\` objects. Do not include extra commentary, markup, or explanatory text.

    Output JSON to produce:
    - An array in the same order as the "questions" input.

    Example call (inputs you will provide to the model):
    {
      "transcript": TRANSCRIPT_JSON,
      "questions": QUESTIONS_JSON
    }

    Example transcript input (Bangla sample):
    [
      { "role": "assistant", "text": "হাই ক্যাপ্টেন জ্যাক স্প্যারো, কেমনাচ্ছ? তুমি কি ইন্টারভিউটির জন্য প্রস্তুত?" },
      { "role": "user", "text": "যে আমি প্রস্তুত" },
      { "role": "assistant", "text": "ঠিকাছে চিন্তার কিছু নেই। আমরা ধীর ধীরে চলুন শুরু করি। সিকিউরিটি ইঞ্জিনিয়ার সাক্ষাৎকারে আপনাকে স্বাগতম। আসুন কয়েকটি প্রশ্ন দিয়ে শুরু করি। প্রথম প্রশ্ন, আপনি কিভাবে নিরাপত্তার দুর্বলতাকে চিহ্নিত এবং সংশোধন করবেন?" },
      { "role": "user", "text": "আচ্ছা…মানে প্রথমে হয়তো আমি, উম, একটা ভলনারেবিলিটি স্ক্যান চালাই, ঠিক আছে? তারপর লগগুলো দেখি…মানে যেগুলোতে অস্বাভাবিক কিছু ধরা পড়ে। তারপর আমি ভাবি কোনগুলো আসলেই ঝুঁকিপূর্ণ আর কোনগুলো আসলে তেমন ইমপ্যাক্ট ফেলবে না। 
       গুরুতরগুলা, মানে যেগুলো ক্রিটিকাল, সেগুলো আগে ঠিক করি — যেমন প্যাচ ইনস্টল করি বা কনফিগারেশন টুইক করি। তারপর আবার টেস্ট চালাই যেন নিশ্চিত হই যে, মানে, ওই সমস্যা আর নেই।" }
    ]

    Example questions input:
    [
      { "question": "আপনি কিভাবে নিরাপত্তার দুর্বলতাকে চিহ্নিত এবং সংশোধন করবেন?",
       "question" : ".........." }
    ]

    Expected JSON output (exact format—nothing else):
    [
      {
        "question": "আপনি কিভাবে নিরাপত্তার দুর্বলতাকে চিহ্নিত এবং সংশোধন করবেন?",
        "candidateAnswer": "প্রথমে আমি সিস্টেমে স্বয়ংক্রিয় ভলনারেবিলিটি স্ক্যান চালাই এবং লগ বিশ্লেষণ করি। এরপর সম্ভাব্য দুর্বলতাগুলো প্রায়োরিটি অনুযায়ী তালিকাভুক্ত করি। যেগুলো গুরুতর, সেগুলো দ্রুত প্যাচ করি বা কনফিগারেশন ঠিক করি। 
        সবশেষে আবার টেস্ট চালিয়ে নিশ্চিত করি যে সমস্যাগুলো সমাধান হয়েছে।",
    ]

    Notes:
    - Preserve language (do not translate candidate answers).
    - If multiple user messages across turns belong to the same question, join them in one string.
    - If you spot system messages or assistant small-talk between question and answer, ignore assistant text — only aggregate \`user\` messages.
    - Output must be valid JSON (UTF-8) and parseable.

    Now: produce the JSON array for the provided "transcript" and "questions" inputs.

    {
      "transcript": ${JSON.stringify(transcript,null,2)},
      "questions": ${JSON.stringify(quesArray, null, 2)}
    }`.trim();
}
