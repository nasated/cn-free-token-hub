import assert from "node:assert/strict";
import test from "node:test";
import { candidateLead, candidateTitle, kindFromTitle, platformFromTitle } from "../scripts/lib/discovery-classifier";

test("accepts new product gifts and discounts as leads", () => {
  assert.equal(candidateTitle("新产品获赠 AI API Token 限时活动"), true);
  assert.equal(candidateTitle("某模型 API Token 价格五折优惠"), true);
  assert.equal(candidateTitle("智谱Zcode9月24日继续免费3亿GLM-5.3-Flash"), true);
  assert.equal(candidateTitle("又能薅两周token，还是顶尖flash模型"), true);
  assert.equal(candidateTitle("claude-opus-5-5 价格也不高，回复送体验金额"), true);
  assert.equal(candidateTitle("芒果 AI GPT 0.1 倍率限时活动"), true);
  assert.equal(kindFromTitle("某模型 API Token 价格五折优惠"), "discount");
  assert.equal(kindFromTitle("芒果 AI GPT 0.1 倍率限时活动"), "low_price");
  assert.equal(platformFromTitle("新产品获赠 AI API Token 限时活动"), "新产品／待识别");
});

test("rejects observed unrelated Token headlines", () => {
  assert.equal(candidateTitle("全新一代智己LS6送AI Token终身免费"), false);
  assert.equal(candidateTitle("最高降价99%背后：小米首次公开模型推理优化技术报告"), false);
  assert.equal(candidateTitle("经济学家宋清辉：送Token本质上是AI时代一种新的营销方式"), false);
  assert.equal(candidateTitle("免费体验 AI 工具稳定调用、API 调用与自动化脚本、住宅IP"), false);
  assert.equal(candidateTitle("The official IDA MCP Server is free and uses 20% fewer tokens with any LLM"), false);
  assert.equal(candidateTitle("Super AI crypto wallet reads your Ethereum tokens for free"), false);
  assert.equal(candidateTitle("Senior leaders thought AI Tokens were free, but vendors changed subscriptions & pricing"), false);
});

test("community referral spam is filtered while small-product offers remain", () => {
  assert.equal(candidateLead("AI free tokens: redeem code ABC123 within 48h", "community"), false);
  assert.equal(candidateLead("Muse AI free Tokens #ad #aitools", "community"), false);
  assert.equal(candidateLead("芒果 AI GPT 0.1 倍率限时活动", "community"), true);
  assert.equal(candidateLead("AI free tokens: redeem code ABC123 within 48h", "news"), true);
});
