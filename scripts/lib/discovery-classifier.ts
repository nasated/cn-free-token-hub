import type { ActivityKind } from "../../lib/activity";

const modelTerms = /\bAI\b|\bLLM\b|\bmodel\b|人工智能|大模型|模型|\bAPI\b|GLM|DeepSeek|Qwen|Kimi|MiniMax|ZCode|AutoClaw|Cavoti|Claude|Opus|GPT|OpenRouter|Mistral|Groq|Together|Fireworks|百炼|智谱|硅基流动/i;
const quotaTerms = /Token|额度|积分|Credits?|算力|体验金额|试用金|\d+(?:\.\d+)?\s*(?:亿|万)/i;
const offerTerms = /免费|赠送|送|限时|折扣|优惠|降价|半价|五折|促销|活动|试用|补贴|礼包|薅|白嫖|畅用|限免|倍率|低价|便宜|\bOFF\b|\bfree\b|giveaway|discount|promotion|promo|price cut|trial|\d+(?:\.\d+)?\s*(?:¢|\$|¥|元)\s*\//i;
const directAccessTerms = /免费(?:调用|使用)|限时免费|free (?:API|access|usage)|\d+(?:\.\d+)?\s*倍率|\d+\s*%\s*OFF/i;
const offTopicTerms = /汽车|智己|LS6|新车|车型|车企|上市权益价|股市|公募基金|比特币|加密货币|区块链|楼市|推理优化技术报告|经济学家|本质上|营销方式|代理IP|住宅IP|代充服务|crypto wallet|Ethereum|Solana|\bBNB Chain\b|not free|fewer tokens|less tokens|free rein with tokens|hiring nonstop|\b(?:thought|assumed)\b.{0,100}\b(?:tokens?|credits?)\b.{0,30}\b(?:were|are) free\b/i;
const referralTerms = /#ad\b|#freebies\b|\b(?:redeem|referral) code\b|\bI get\b.{0,30}\btoo\b|\bwhop\.com\/paydirt\b/i;

export function candidateTitle(title: string): boolean {
  return modelTerms.test(title) && (quotaTerms.test(title) || directAccessTerms.test(title)) && offerTerms.test(title) && !offTopicTerms.test(title);
}

export function candidateLead(title: string, sourceType: "official" | "news" | "community"): boolean {
  return candidateTitle(title) && !(sourceType === "community" && referralTerms.test(title));
}

export function kindFromTitle(title: string): ActivityKind {
  if (/折扣|降价|半价|五折|优惠|\bOFF\b|discount|price cut/i.test(title)) return "discount";
  if (/限时免费|免费使用|免费调用|免费开放|无限|不限量|free access|free usage|unlimited/i.test(title)) return "free_access";
  if (/低价|便宜|倍率|\d+(?:\.\d+)?\s*(?:¢|\$|¥|元)\s*\/\s*(?:1M|百万)/i.test(title)) return "low_price";
  return "gift";
}

export function platformFromTitle(title: string): string {
  const known: [RegExp, string][] = [
    [/AutoClaw/i, "AutoClaw"], [/ZCode/i, "ZCode"], [/智谱|GLM/i, "智谱／GLM"],
    [/阿里|百炼|Qwen|通义/i, "阿里百炼／Qwen"], [/DeepSeek/i, "DeepSeek"],
    [/Kimi|Moonshot/i, "Kimi"], [/MiniMax/i, "MiniMax"], [/硅基流动|SiliconFlow/i, "硅基流动"],
  ];
  return known.find(([pattern]) => pattern.test(title))?.[1] || "新产品／待识别";
}
