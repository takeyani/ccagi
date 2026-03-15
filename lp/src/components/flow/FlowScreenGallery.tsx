"use client";

import {
  MakerDashboardScreen,
  ProductRegistrationScreen,
  LotManagementScreen,
  ProofChainScreen,
  InquiryScreen,
  InvoiceScreen,
} from "./MakerScreens";

import {
  BuyerDashboardScreen,
  AgentCreateScreen,
  AgentResultScreen,
  InquiryCreateScreen,
  CheckoutScreen,
  OrderHistoryScreen,
} from "./BuyerScreens";

import {
  CreatorDashboardScreen,
  LPEditorScreen,
  CollectionScreen,
  PublicLPScreen,
  AnalyticsScreen,
} from "./CreatorScreens";

type ScreenEntry = {
  stepNumber: string;
  component: React.ReactNode;
};

export function MakerScreenGallery({ stepNumber }: { stepNumber: string }) {
  const screens: Record<string, ScreenEntry[]> = {
    "01": [{ stepNumber: "01", component: <MakerDashboardScreen /> }],
    "02": [
      { stepNumber: "02", component: <ProductRegistrationScreen /> },
      { stepNumber: "02", component: <LotManagementScreen /> },
    ],
    "03": [{ stepNumber: "03", component: <ProofChainScreen /> }],
    "04": [{ stepNumber: "04", component: <InquiryScreen /> }],
    "05": [{ stepNumber: "05", component: <InvoiceScreen /> }],
  };
  const entries = screens[stepNumber];
  if (!entries) return null;
  return <div className="space-y-3">{entries.map((e, i) => <div key={i}>{e.component}</div>)}</div>;
}

export function AgentScreenGallery({ stepNumber }: { stepNumber: string }) {
  const screens: Record<string, React.ReactNode[]> = {
    "01": [<MakerDashboardScreen key="d" />], // 代理店のダッシュボードも同じ構造
    "03": [<LPEditorScreen key="lp" />],
  };
  const entries = screens[stepNumber];
  if (!entries) return null;
  return <div className="space-y-3">{entries.map((e, i) => <div key={i}>{e}</div>)}</div>;
}

export function BuyerScreenGallery({ stepNumber }: { stepNumber: string }) {
  const screens: Record<string, React.ReactNode[]> = {
    "01": [<BuyerDashboardScreen key="d" />],
    "02": [<AgentCreateScreen key="a" />],
    "03": [<AgentResultScreen key="r" />],
    "04": [<InquiryCreateScreen key="i" />],
    "05": [<CheckoutScreen key="c" />],
    "06": [<OrderHistoryScreen key="o" />],
  };
  const entries = screens[stepNumber];
  if (!entries) return null;
  return <div className="space-y-3">{entries.map((e, i) => <div key={i}>{e}</div>)}</div>;
}

export function CreatorScreenGallery({ stepNumber }: { stepNumber: string }) {
  const screens: Record<string, React.ReactNode[]> = {
    "01": [<CreatorDashboardScreen key="d" />],
    "03": [<LPEditorScreen key="lp" />],
    "04": [<CollectionScreen key="c" />],
    "05": [<PublicLPScreen key="p" />],
    "06": [<AnalyticsScreen key="a" />],
  };
  const entries = screens[stepNumber];
  if (!entries) return null;
  return <div className="space-y-3">{entries.map((e, i) => <div key={i}>{e}</div>)}</div>;
}
