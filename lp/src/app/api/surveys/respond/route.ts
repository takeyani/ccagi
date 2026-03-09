import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { survey_id, respondent_name, respondent_email, answers } = body;

    if (!survey_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 回答レコード作成
    const { data: response, error: respError } = await supabase
      .from("survey_responses")
      .insert({
        survey_id,
        respondent_name: respondent_name || null,
        respondent_email: respondent_email || null,
      })
      .select("id")
      .single();

    if (respError) {
      console.error("survey_responses insert error:", respError);
      return NextResponse.json(
        { error: "回答の保存中にエラーが発生しました" },
        { status: 500 }
      );
    }

    // 各回答を保存
    const answerRows = answers.map(
      (a: { question_id: string; answer_text?: string; answer_options?: string[] }) => ({
        response_id: response.id,
        question_id: a.question_id,
        answer_text: a.answer_text || null,
        answer_options: a.answer_options || [],
      })
    );

    const { error: ansError } = await supabase
      .from("survey_answers")
      .insert(answerRows);

    if (ansError) {
      console.error("survey_answers insert error:", ansError);
      return NextResponse.json(
        { error: "回答の保存中にエラーが発生しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Survey respond API error:", err);
    return NextResponse.json(
      { error: "回答の保存中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
