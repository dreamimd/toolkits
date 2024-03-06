export interface VersionData {
  /** 配置文件的版本号，决定了配置文件的下载路径 */
  version: number

  /** 解码配置文件的 hash 指 */
  hash: string
}

export interface SongData {
  m_ushSongID: string
  m_iVersion: string
  m_szSongName: string
  m_szPath: string
  m_szArtist: string
  m_szComposer: string
  m_szSongTime: string
  m_iGameTime: string
  m_iRegion: string
  m_iStyle: string
  m_ucIsNew: string
  m_ucIsHot: string
  m_ucIsRecommend: string
  m_szBPM: string
  m_ucIsOpen: string
  m_ucCanBuy: string
  m_iOrderIndex: string
  m_bIsFree: string
  m_bSongPkg: string
  m_szFreeBeginTime: string
  m_szFreeEndTime: string
  m_ush4KeyEasy: string
  m_ush4KeyNormal: string
  m_ush4KeyHard: string
  m_ush5KeyEasy: string
  m_ush5KeyNormal: string
  m_ush5KeyHard: string
  m_ush6KeyEasy: string
  m_ush6KeyNormal: string
  m_ush6KeyHard: string
  m_iPrice: string
  m_szNoteNumber: string
  m_szProductID: string
  m_iVipFlag: string
  m_bIsHide: string
  m_bIsReward: string
  m_bIsLevelReward: string
  m_bIsVIP: string
  m_ushTypeMark: string
}
