"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBuyerId } from "@/lib/auth";
import { createNotification } from "@/lib/activity";

export async function createAgent(formData: FormData) {
  const { buyerId, supabase } = await requireBuyerId();

  const tagIds = formData.getAll("tag_ids") as string[];

  let specRequirements = [];
  try {
    specRequirements = JSON.parse(
      (formData.get("spec_requirements") as string) || "[]"
    );
  } catch {
    specRequirements = [];
  }

  const autoBidEnabled = formData.get("auto_bid_enabled") === "on";
  const autoBidMaxPrice = formData.get("auto_bid_max_price")
    ? Number(formData.get("auto_bid_max_price"))
    : null;

  const { error } = await supabase.from("buying_agents").insert({
    owner_id: buyerId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    keyword: (formData.get("keyword") as string) || null,
    target_tag_ids: tagIds,
    min_price: formData.get("min_price")
      ? Number(formData.get("min_price"))
      : null,
    max_price: formData.get("max_price")
      ? Number(formData.get("max_price"))
      : null,
    require_certified: formData.get("require_certified") === "on",
    require_entity_proof: formData.get("require_entity_proof") === "on",
    require_product_proof: formData.get("require_product_proof") === "on",
    spec_requirements: specRequirements,
    certification_weight: Number(formData.get("certification_weight") || 80),
    proof_chain_weight: Number(formData.get("proof_chain_weight") || 60),
    preferred_partner_type:
      (formData.get("preferred_partner_type") as string) || null,
    require_in_stock: formData.get("require_in_stock") === "on",
    min_total_score: formData.get("min_total_score")
      ? Number(formData.get("min_total_score"))
      : null,
    auto_bid_enabled: autoBidEnabled,
    auto_bid_max_price: autoBidMaxPrice,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/buyer/agents");
  redirect("/buyer/agents");
}

export async function updateAgent(id: string, formData: FormData) {
  const { buyerId, supabase } = await requireBuyerId();

  const tagIds = formData.getAll("tag_ids") as string[];

  let specRequirements = [];
  try {
    specRequirements = JSON.parse(
      (formData.get("spec_requirements") as string) || "[]"
    );
  } catch {
    specRequirements = [];
  }

  const autoBidEnabled = formData.get("auto_bid_enabled") === "on";
  const autoBidMaxPrice = formData.get("auto_bid_max_price")
    ? Number(formData.get("auto_bid_max_price"))
    : null;

  const { error } = await supabase
    .from("buying_agents")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      keyword: (formData.get("keyword") as string) || null,
      target_tag_ids: tagIds,
      min_price: formData.get("min_price")
        ? Number(formData.get("min_price"))
        : null,
      max_price: formData.get("max_price")
        ? Number(formData.get("max_price"))
        : null,
      require_certified: formData.get("require_certified") === "on",
      require_entity_proof: formData.get("require_entity_proof") === "on",
      require_product_proof: formData.get("require_product_proof") === "on",
      spec_requirements: specRequirements,
      certification_weight: Number(formData.get("certification_weight") || 80),
      proof_chain_weight: Number(formData.get("proof_chain_weight") || 60),
      preferred_partner_type:
        (formData.get("preferred_partner_type") as string) || null,
      require_in_stock: formData.get("require_in_stock") === "on",
      min_total_score: formData.get("min_total_score")
        ? Number(formData.get("min_total_score"))
        : null,
      auto_bid_enabled: autoBidEnabled,
      auto_bid_max_price: autoBidMaxPrice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", buyerId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buyer/agents/${id}`);
  redirect(`/buyer/agents/${id}`);
}

export async function deleteAgent(id: string) {
  const { buyerId, supabase } = await requireBuyerId();

  const { error } = await supabase
    .from("buying_agents")
    .update({ status: "一時停止", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", buyerId);

  if (error) throw new Error(error.message);
  revalidatePath("/buyer/agents");
  redirect("/buyer/agents");
}

export async function runAgent(id: string) {
  const { buyerId, supabase } = await requireBuyerId();

  // オーナー確認
  const { data: agent } = await supabase
    .from("buying_agents")
    .select("id")
    .eq("id", id)
    .eq("owner_id", buyerId)
    .single();

  if (!agent) throw new Error("エージェントが見つかりません");

  const { error } = await supabase.rpc("run_buying_agent", {
    p_agent_id: id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/buyer/agents/${id}`);
  revalidatePath(`/buyer/agents/${id}/results`);
  redirect(`/buyer/agents/${id}/results`);
}

export async function submitInquiry(resultId: string, formData: FormData) {
  const { buyerId, supabase } = await requireBuyerId();

  // オーナー確認（agent_results → buying_agents.owner_id）
  const { data: result } = await supabase
    .from("agent_results")
    .select(
      "id, agent_id, lot_id, product_id, total_score, score_details, buying_agents!inner(owner_id)"
    )
    .eq("id", resultId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!result || (result.buying_agents as any).owner_id !== buyerId) {
    throw new Error("権限がありません");
  }

  // ステータスを確認済みに更新
  const { error } = await supabase
    .from("agent_results")
    .update({ status: "確認済み" })
    .eq("id", resultId);

  if (error) throw new Error(error.message);

  // products から partner_id を取得
  const { data: product } = await supabase
    .from("products")
    .select("partner_id")
    .eq("id", result.product_id)
    .single();

  if (product?.partner_id) {
    const buyerPrice = formData.get("buyer_price")
      ? Number(formData.get("buyer_price"))
      : null;
    const buyerQuantity = formData.get("buyer_quantity")
      ? Number(formData.get("buyer_quantity"))
      : null;
    const buyerNotes = (formData.get("buyer_notes") as string) || null;

    const { data: inquiry } = await supabase.from("agent_inquiries").upsert(
      {
        agent_result_id: result.id,
        agent_id: result.agent_id,
        buyer_id: buyerId,
        product_id: result.product_id,
        lot_id: result.lot_id,
        partner_id: product.partner_id,
        total_score: result.total_score,
        score_details: result.score_details,
        buyer_price: buyerPrice,
        buyer_quantity: buyerQuantity,
        buyer_notes: buyerNotes,
      },
      { onConflict: "agent_result_id" }
    ).select("id").single();

    // パートナーメンバーへ新規引合い通知
    const { data: partnerMembers } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("partner_id", product.partner_id);

    for (const m of partnerMembers ?? []) {
      await createNotification({
        userId: m.id,
        partnerId: product.partner_id,
        title: "新しい引合いが届きました",
        link: `/partner/inquiries${inquiry?.id ? `/${inquiry.id}` : ""}`,
        notificationType: "inquiry_created",
        entityType: "inquiry",
        entityId: inquiry?.id ?? result.id,
      });
    }
  }

  revalidatePath(`/buyer/agents/${result.agent_id}`);
  revalidatePath(`/buyer/agents/${result.agent_id}/results`);
  revalidatePath("/buyer/inquiries");
}

export async function updateResultStatus(
  resultId: string,
  newStatus: string
) {
  const { buyerId, supabase } = await requireBuyerId();

  // オーナー確認（agent_results → buying_agents.owner_id）
  const { data: result } = await supabase
    .from("agent_results")
    .select(
      "id, agent_id, buying_agents!inner(owner_id)"
    )
    .eq("id", resultId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!result || (result.buying_agents as any).owner_id !== buyerId) {
    throw new Error("権限がありません");
  }

  const { error } = await supabase
    .from("agent_results")
    .update({ status: newStatus })
    .eq("id", resultId);

  if (error) throw new Error(error.message);

  revalidatePath(`/buyer/agents/${result.agent_id}`);
  revalidatePath(`/buyer/agents/${result.agent_id}/results`);
}
