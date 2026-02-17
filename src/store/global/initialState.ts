import { type NavigateFunction } from 'react-router-dom';

import { type MigrationSQL, type MigrationTableItem } from '@/types/clientDB';
import { DatabaseLoadingState } from '@/types/clientDB';
import { type LocaleMode } from '@/types/locale';
import { SessionDefaultGroup } from '@/types/session';
import { AsyncLocalStorage } from '@/utils/localStorage';

export enum SidebarTabKey {
  Chat = 'chat',
  Community = 'community',
  Download = 'download',
  Home = 'home',
  Image = 'image',
  Knowledge = 'knowledge',
  Me = 'me',
  Memory = 'memory',
  Pages = 'pages',
  Resource = 'resource',
  Setting = 'settings',
  Video = 'video',
}

export enum ChatSettingsTabs {
  Chat = 'chat',
  Meta = 'meta',
  Modal = 'modal',
  Opening = 'opening',
  Plugin = 'plugin',
  Prompt = 'prompt',
  TTS = 'tts',
}

export enum GroupSettingsTabs {
  Chat = 'chat',
  Members = 'members',
  Settings = 'settings',
}

export enum SettingsTabs {
  About = 'about',
  Agent = 'agent',
  APIKey = 'apikey',
  Billing = 'billing',
  ChatAppearance = 'chat-appearance',
  Common = 'common',
  Funds = 'funds',
  Hotkey = 'hotkey',
  Image = 'image',
  LLM = 'llm',
  Memory = 'memory',
  // business
  Plans = 'plans',
  Profile = 'profile',
  Provider = 'provider',
  Proxy = 'proxy',
  Referral = 'referral',
  Security = 'security',
  Skill = 'skill',

  /* eslint-disable typescript-sort-keys/string-enum */
  Stats = 'stats',
  Storage = 'storage',
  SystemTools = 'system-tools',
  TTS = 'tts',
  Usage = 'usage',
  /* eslint-enable typescript-sort-keys/string-enum */
}

/**
 * @deprecated Use SettingsTabs instead
 */
export enum ProfileTabs {
  APIKey = 'apikey',
  Memory = 'memory',
  Profile = 'profile',
  Security = 'security',
  Stats = 'stats',
  Usage = 'usage',
}

export interface SystemStatus {
  /**
   * Agent Builder panel width
   */
  agentBuilderPanelWidth?: number;
  /**
   * number of agents (defaultList) to display
   */
  agentPageSize?: number;
  chatInputHeight?: number;
  disabledModelProvidersSortType?: string;
  disabledModelsSortType?: string;
  expandInputActionbar?: boolean;
  // which sessionGroup should expand
  expandSessionGroupKeys: string[];
  // which topicGroup should expand
  expandTopicGroupKeys?: string[];
  fileManagerViewMode?: 'list' | 'masonry';
  filePanelWidth: number;
  /**
   * Group Agent Builder panel width
   */
  groupAgentBuilderPanelWidth?: number;
  hideGemini2_5FlashImagePreviewChineseWarning?: boolean;
  hidePWAInstaller?: boolean;
  hideThreadLimitAlert?: boolean;
  hideTopicSharePrivacyWarning?: boolean;
  imagePanelWidth: number;
  imageTopicPanelWidth?: number;
  /**
   * 应用初始化时不启用 PGLite，只有当用户手动开启时才启用
   */
  isEnablePglite?: boolean;
  isShowCredit?: boolean;
  knowledgeBaseModalViewMode?: 'list' | 'masonry';
  language?: LocaleMode;
  /**
   * 记住用户最后选择的图像生成模型
   */
  lastSelectedImageModel?: string;
  /**
   * 记住用户最后选择的图像生成提供商
   */
  lastSelectedImageProvider?: string;
  lastSelectedVideoModel?: string;
  lastSelectedVideoProvider?: string;
  latestChangelogId?: string;
  leftPanelWidth: number;
  mobileShowPortal?: boolean;
  mobileShowTopic?: boolean;
  /**
   * ModelSwitchPanel 的分组模式
   */
  modelSwitchPanelGroupMode?: 'byModel' | 'byProvider';
  /**
   * ModelSwitchPanel 的宽度
   */
  modelSwitchPanelWidth?: number;
  noWideScreen?: boolean;
  pageAgentPanelWidth?: number;
  /**
   * number of pages (documents) to display per page
   */
  pagePageSize?: number;
  portalWidth: number;
  readNotificationSlugs?: string[];
  /**
   * Resource Manager column widths
   */
  resourceManagerColumnWidths?: {
    date: number;
    name: number;
    size: number;
  };
  showCommandMenu?: boolean;
  showFilePanel?: boolean;
  showHotkeyHelper?: boolean;
  showImagePanel?: boolean;
  showImageTopicPanel?: boolean;
  showLeftPanel?: boolean;
  showRightPanel?: boolean;
  showSystemRole?: boolean;
  showVideoPanel?: boolean;
  showVideoTopicPanel?: boolean;
  systemRoleExpandedMap: Record<string, boolean>;
  /**
   * 是否使用短格式显示 token
   */
  tokenDisplayFormatShort?: boolean;
  /**
   * number of topics to display per page
   */
  topicPageSize?: number;
  videoPanelWidth: number;
  videoTopicPanelWidth?: number;
  zenMode?: boolean;
}

export interface GlobalState {
  hasNewVersion?: boolean;
  initClientDBError?: Error;
  initClientDBMigrations?: {
    sqls: MigrationSQL[];
    tableRecords: MigrationTableItem[];
  };

  initClientDBProcess?: { costTime?: number; phase: 'wasm' | 'dependencies'; progress: number };
  /**
   * 客户端数据库初始化状态
   * 启动时为 Idle，完成为 Ready，报错为 Error
   */
  initClientDBStage: DatabaseLoadingState;
  isMobile?: boolean;
  /**
   * 服务端版本过旧，不支持 /api/version 接口
   * 需要提示用户更新服务端
   */
  isServerVersionOutdated?: boolean;
  isStatusInit?: boolean;
  latestVersion?: string;
  navigate?: NavigateFunction;
  /**
   * 服务端版本号，用于检测客户端与服务端版本是否一致
   */
  serverVersion?: string;
  sidebarKey: SidebarTabKey;
  status: SystemStatus;
  statusStorage: AsyncLocalStorage<SystemStatus>;
}

export const INITIAL_STATUS = {
  agentBuilderPanelWidth: 360,
  agentPageSize: 10,
  chatInputHeight: 64,
  disabledModelProvidersSortType: 'default',
  disabledModelsSortType: 'default',
  expandInputActionbar: true,
  expandSessionGroupKeys: [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default],
  fileManagerViewMode: 'list' as const,
  filePanelWidth: 320,
  groupAgentBuilderPanelWidth: 360,
  hideGemini2_5FlashImagePreviewChineseWarning: false,
  hidePWAInstaller: false,
  hideThreadLimitAlert: false,
  hideTopicSharePrivacyWarning: false,
  imagePanelWidth: 320,
  imageTopicPanelWidth: 80,
  knowledgeBaseModalViewMode: 'list' as const,
  leftPanelWidth: 320,
  mobileShowTopic: false,
  modelSwitchPanelGroupMode: 'byProvider',
  modelSwitchPanelWidth: 430,
  noWideScreen: true,
  pageAgentPanelWidth: 360,
  pagePageSize: 20,
  portalWidth: 400,
  readNotificationSlugs: [],
  resourceManagerColumnWidths: {
    date: 160,
    name: 574,
    size: 140,
  },
  showCommandMenu: false,
  showFilePanel: true,
  showHotkeyHelper: false,
  showImagePanel: true,
  showImageTopicPanel: true,
  showLeftPanel: true,
  showRightPanel: true,
  showSystemRole: false,
  showVideoPanel: true,
  showVideoTopicPanel: true,
  systemRoleExpandedMap: {},
  tokenDisplayFormatShort: true,
  topicPageSize: 20,
  videoPanelWidth: 320,
  videoTopicPanelWidth: 80,
  zenMode: false,
} satisfies SystemStatus;

export const initialState: GlobalState = {
  initClientDBStage: DatabaseLoadingState.Idle,
  isMobile: false,
  isStatusInit: false,
  sidebarKey: SidebarTabKey.Chat,
  status: INITIAL_STATUS,
  statusStorage: new AsyncLocalStorage('LOBE_SYSTEM_STATUS'),
};
