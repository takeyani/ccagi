import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Survey, SurveyQuestion } from "@/lib/types";
import { SurveyForm } from "@/components/surveys/SurveyForm";

type Props = {
  params: Promise<{ surveyId: string }>;
};

export default async function SurveyPage({ params }: Props) {
  const { surveyId } = await params;
  const supabase = getSupabase();

  const { data: survey } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", surveyId)
    .eq("is_active", true)
    .single<Survey>();

  if (!survey) notFound();

  const { data: questions } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("survey_id", surveyId)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; トップページに戻る
          </Link>
        </nav>

        <SurveyForm
          survey={survey}
          questions={(questions as SurveyQuestion[]) ?? []}
        />
      </div>
    </div>
  );
}
