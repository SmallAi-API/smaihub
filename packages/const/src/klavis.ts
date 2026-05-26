import type { IconType } from '@icons-pack/react-simple-icons';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Klavis } from 'klavis';

export interface KlavisServerType {
  /**
   * Author/Developer of the integration
   */
  author: string;
  /**
   * Author's website URL
   */
  authorUrl?: string;
  description: string;
  icon: string | IconType;
  /**
   * Identifier used for storage in database (e.g., 'google-calendar')
   * Format: lowercase, spaces replaced with hyphens
   */
  identifier: string;
  label: string;
  readme: string;
  /**
   * Server name used to call Klavis API (e.g., 'Google Calendar')
   */
  serverName: Klavis.McpServerName;
}

export const KLAVIS_SERVER_TYPES: KlavisServerType[] = [
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description: 'Gmail is a free email service provided by Google',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/gmail.svg',
    identifier: 'gmail',
    readme:
      'Bring the power of Gmail directly into your AI assistant. Read, compose, and send emails, search your inbox, manage labels, and organize your communications—all through natural conversation.',
    label: 'Gmail',
    serverName: Klavis.McpServerName.Gmail,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description: 'Google Calendar is a time-management and scheduling calendar service',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googlecalendar.svg',
    identifier: 'google-calendar',
    readme:
      'Integrate Google Calendar to view, create, and manage your events seamlessly. Schedule meetings, set reminders, check availability, and coordinate your time—all through natural language commands.',
    label: 'Google Calendar',
    serverName: Klavis.McpServerName.GoogleCalendar,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'Google Sheets is a web-based spreadsheet application that allows users to create, edit, and collaborate on spreadsheets online',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googlesheets.svg',
    identifier: 'google-sheets',
    readme:
      'Connect to Google Sheets to read, write, and analyze spreadsheet data. Perform calculations, generate reports, create charts, and manage tabular data collaboratively with AI assistance.',
    label: 'Google Sheets',
    serverName: Klavis.McpServerName.GoogleSheets,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'Google Docs is a word processor included as part of the free, web-based Google Docs Editors suite',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googledocs.svg',
    identifier: 'google-docs',
    readme:
      'Integrate with Google Docs to create, edit, and manage documents. Write content, format text, collaborate in real-time, and access your documents through natural conversation.',
    label: 'Google Docs',
    serverName: Klavis.McpServerName.GoogleDocs,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description: 'Supabase official MCP Server',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/supabase.svg',
    identifier: 'supabase',
    readme:
      'Integrate with Supabase to manage your database and backend services. Query data, manage authentication, handle storage, and interact with your application backend through natural conversation.',
    label: 'Supabase',
    serverName: Klavis.McpServerName.Supabase,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description: 'Google Drive is a cloud storage service',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googledrive.svg',
    identifier: 'google-drive',
    readme:
      'Connect to Google Drive to access, organize, and manage your files. Search documents, upload files, share content, and navigate your cloud storage efficiently through AI assistance.',
    label: 'Google Drive',
    serverName: Klavis.McpServerName.GoogleDrive,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'Slack is a messaging app for business that connects people to the information they need',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/slack.svg',
    identifier: 'slack',
    readme:
      'Integrate with Slack to send messages, search conversations, and manage channels. Connect with your team, automate communication workflows, and access workspace information through natural language.',
    label: 'Slack',
    serverName: Klavis.McpServerName.Slack,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description: 'Figma is a collaborative interface design tool for web and mobile applications.',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/figma.svg',
    identifier: 'figma',
    readme:
      'Connect to Figma to access design files and collaborate on projects. View designs, export assets, browse components, and manage your design workflow through natural conversation.',
    label: 'Figma',
    serverName: Klavis.McpServerName.Figma,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'OneDrive is a file hosting service and synchronization service operated by Microsoft',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/onedrive.svg',
    identifier: 'onedrive',
    readme:
      'Connect to OneDrive to access and manage your Microsoft cloud files. Upload, download, share files, organize folders, and collaborate on documents through AI-powered assistance.',
    label: 'OneDrive',
    serverName: Klavis.McpServerName.Onedrive,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'Outlook Mail is a web-based suite of webmail, contacts, tasks, and calendaring services from Microsoft.',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/outlook.svg',
    identifier: 'outlook-mail',
    readme:
      'Integrate with Outlook Mail to read, send, and manage your Microsoft emails. Search messages, compose emails, manage folders, and organize your inbox through natural conversation.',
    label: 'Outlook Mail',
    serverName: Klavis.McpServerName.OutlookMail,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'WhatsApp Business API integration that enables sending text messages, media, and managing conversations with customers. Perfect for customer support, marketing campaigns, and automated messaging workflows through the official WhatsApp Business platform.',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/whatsapp.svg',
    identifier: 'whatsapp',
    readme:
      'Integrate with WhatsApp Business to send messages, manage conversations, and engage with customers. Automate messaging workflows and handle communications through conversational AI.',
    label: 'WhatsApp',
    serverName: Klavis.McpServerName.Whatsapp,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description:
      'GitHub is a platform for version control and collaboration, enabling developers to host, review, and manage code repositories.',
    icon: SiGithub, // 顶部 import { SiGithub, SiNotion } from '@icons-pack/react-simple-icons'
    identifier: 'github',
    label: 'GitHub',
    readme:
      'Connect to GitHub via Klavis to access repositories, manage issues, review pull requests, and collaborate on code through natural conversation.',
    serverName: Klavis.McpServerName.Github,
  },
  {
    author: 'Klavis',
    authorUrl: 'https://klavis.io',
    description: 'Notion is a collaborative productivity and note-taking application.',
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/notion.svg',
    identifier: 'notion',
    label: 'Notion',
    readme:
      'Connect to Notion via Klavis to access and manage your workspace—create pages, search content, update databases, and organize your knowledge base.',
    serverName: Klavis.McpServerName.Notion,
  },
];

/**
 * Get server config by identifier
 */
export const getKlavisServerByServerIdentifier = (identifier: string) =>
  KLAVIS_SERVER_TYPES.find((s) => s.identifier === identifier);
