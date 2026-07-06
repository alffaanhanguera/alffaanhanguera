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
