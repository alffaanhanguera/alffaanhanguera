export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  description: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  variation: string;
};

export type ConversationListItem = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  status: string;
  operator: string;
  tags: string[];
};

export type ConversationMessageItem = {
  id: string;
  text: string;
  inbound: boolean;
  time: string;
  type: string;
};

export type ConversationDetail = {
  id: string;
  leadName: string;
  phone: string;
  status: string;
  aiEnabled: boolean;
  aiSummary: string | null;
  operator: string;
  modality: string;
  shift: string;
  benefitSummary: string;
  messages: ConversationMessageItem[];
};
