import { WorkflowMetadata } from './workflowStates'
import { PathwayTemplate } from '../types/pathway'
import { LocalOverride } from './pathwayOverrides'

export type NotificationType = 
  | 'pathway_published' 
  | 'pathway_review_requested'
  | 'pathway_approved'
  | 'pathway_rejected'
  | 'system_update'
  | 'nhg_deviation_alert'

export interface Notification {
  id: string
  type: NotificationType
  title: { en: string; nl: string }
  message: { en: string; nl: string }
  userId?: string // If undefined, notification is for all users
  userRole?: string // If specified, only for users with this role
  createdAt: string
  readAt?: string
  actionRequired: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  data: {
    overrideId?: string
    templateId?: string
    templateName?: string
    publishedBy?: string
    deviations?: Array<{
      field: string
      nhgValue: any
      localValue: any
      riskLevel: 'low' | 'medium' | 'high' | 'critical'
    }>
    actionUrl?: string
  }
  expiresAt?: string
}

class NotificationManager {
  private storageKey = 'practiceNotifications'
  private maxNotifications = 200

  // Create notification for pathway publication
  notifyPathwayPublished(
    override: LocalOverride,
    template: PathwayTemplate,
    workflow: WorkflowMetadata
  ): Notification {
    const notification: Notification = {
      id: `pub-${override.id}-${Date.now()}`,
      type: 'pathway_published',
      title: {
        en: 'Pathway Updated',
        nl: 'Zorgpad Bijgewerkt'
      },
      message: {
        en: `Local override for "${template.name.en}" has been published and is now active.`,
        nl: `Lokale overschrijving voor "${template.name.nl || template.name.en}" is gepubliceerd en nu actief.`
      },
      createdAt: new Date().toISOString(),
      actionRequired: true,
      priority: 'high',
      data: {
        overrideId: override.id,
        templateId: template.id,
        templateName: template.name.en,
        publishedBy: workflow.publishedBy,
        actionUrl: `/config/templates/${template.id}/override/${override.id}`
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }

    return this.addNotification(notification)
  }

  // Create notification for review request
  notifyReviewRequested(
    override: LocalOverride,
    template: PathwayTemplate,
    requestedBy: string
  ): Notification {
    const notification: Notification = {
      id: `rev-${override.id}-${Date.now()}`,
      type: 'pathway_review_requested',
      title: {
        en: 'Review Requested',
        nl: 'Beoordeling Aangevraagd'
      },
      message: {
        en: `${requestedBy} has requested review for pathway override "${template.name.en}".`,
        nl: `${requestedBy} heeft beoordeling aangevraagd voor zorgpad overschrijving "${template.name.nl || template.name.en}".`
      },
      userRole: 'gp', // Only GPs can review
      createdAt: new Date().toISOString(),
      actionRequired: true,
      priority: 'medium',
      data: {
        overrideId: override.id,
        templateId: template.id,
        templateName: template.name.en,
        actionUrl: `/config/templates/${template.id}/override/${override.id}/review`
      }
    }

    return this.addNotification(notification)
  }

  // Create notification for NHG deviations
  notifyNHGDeviations(
    override: LocalOverride,
    template: PathwayTemplate,
    deviations: Array<{
      field: string
      nhgValue: any
      localValue: any
      riskLevel: 'low' | 'medium' | 'high' | 'critical'
    }>
  ): Notification {
    const highRiskDeviations = deviations.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical')
    const priority = highRiskDeviations.length > 0 ? 'urgent' : 'high'

    const notification: Notification = {
      id: `dev-${override.id}-${Date.now()}`,
      type: 'nhg_deviation_alert',
      title: {
        en: 'NHG Deviation Alert',
        nl: 'NHG Afwijking Waarschuwing'
      },
      message: {
        en: `Pathway "${template.name.en}" contains ${deviations.length} deviation(s) from NHG guidelines. ${highRiskDeviations.length > 0 ? 'High-risk deviations detected.' : ''}`,
        nl: `Zorgpad "${template.name.nl || template.name.en}" bevat ${deviations.length} afwijking(en) van NHG richtlijnen. ${highRiskDeviations.length > 0 ? 'Hoog-risico afwijkingen gedetecteerd.' : ''}`
      },
      createdAt: new Date().toISOString(),
      actionRequired: true,
      priority,
      data: {
        overrideId: override.id,
        templateId: template.id,
        templateName: template.name.en,
        deviations,
        actionUrl: `/config/templates/${template.id}/override/${override.id}/deviations`
      },
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    }

    return this.addNotification(notification)
  }

  // Get notifications for a user
  getUserNotifications(userId: string, userRole: string, unreadOnly: boolean = false): Notification[] {
    const notifications = this.getAllNotifications()
    const now = new Date()

    return notifications.filter(notification => {
      // Check if expired
      if (notification.expiresAt && new Date(notification.expiresAt) < now) {
        return false
      }

      // Check if for specific user
      if (notification.userId && notification.userId !== userId) {
        return false
      }

      // Check if for specific role
      if (notification.userRole && notification.userRole !== userRole) {
        return false
      }

      // Check if unread only
      if (unreadOnly && notification.readAt) {
        return false
      }

      return true
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Mark notification as read
  markAsRead(notificationId: string, _userId: string): void {
    const notifications = this.getAllNotifications()
    const notification = notifications.find(n => n.id === notificationId)
    
    if (notification && !notification.readAt) {
      notification.readAt = new Date().toISOString()
      this.saveNotifications(notifications)
    }
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string, userRole: string): void {
    const notifications = this.getAllNotifications()
    let hasChanges = false

    notifications.forEach(notification => {
      // Check if notification is for this user
      const isForUser = (!notification.userId || notification.userId === userId) &&
                       (!notification.userRole || notification.userRole === userRole)
      
      if (isForUser && !notification.readAt) {
        notification.readAt = new Date().toISOString()
        hasChanges = true
      }
    })

    if (hasChanges) {
      this.saveNotifications(notifications)
    }
  }

  // Get notification statistics
  getNotificationStats(userId: string, userRole: string) {
    const notifications = this.getUserNotifications(userId, userRole)
    const unread = this.getUserNotifications(userId, userRole, true)
    
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const actionRequired = notifications.filter(n => n.actionRequired && !n.readAt).length

    return {
      total: notifications.length,
      unread: unread.length,
      actionRequired,
      byType,
      byPriority
    }
  }

  // Clean up expired notifications
  cleanupExpired(): void {
    const notifications = this.getAllNotifications()
    const now = new Date()
    
    const validNotifications = notifications.filter(notification => 
      !notification.expiresAt || new Date(notification.expiresAt) >= now
    )

    if (validNotifications.length !== notifications.length) {
      this.saveNotifications(validNotifications)
    }
  }

  // Get all practice-wide notifications (for admin dashboard)
  getPracticeNotifications(): Notification[] {
    return this.getAllNotifications()
      .filter(n => !n.userId) // Only practice-wide notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Create system notification
  createSystemNotification(
    title: { en: string; nl: string },
    message: { en: string; nl: string },
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    actionRequired: boolean = false,
    expiresInDays: number = 30
  ): Notification {
    const notification: Notification = {
      id: `sys-${Date.now()}`,
      type: 'system_update',
      title,
      message,
      createdAt: new Date().toISOString(),
      actionRequired,
      priority,
      data: {},
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    }

    return this.addNotification(notification)
  }

  // Private methods
  private addNotification(notification: Notification): Notification {
    const notifications = this.getAllNotifications()
    notifications.unshift(notification)

    // Keep only the most recent notifications
    if (notifications.length > this.maxNotifications) {
      notifications.splice(this.maxNotifications)
    }

    this.saveNotifications(notifications)
    return notification
  }

  private getAllNotifications(): Notification[] {
    const stored = sessionStorage.getItem(this.storageKey)
    if (!stored) return []
    
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing notifications:', error)
      return []
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(notifications))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }
}

export const notificationManager = new NotificationManager()

// Helper functions
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'pathway_published': return '📋'
    case 'pathway_review_requested': return '👁️'
    case 'pathway_approved': return '✅'
    case 'pathway_rejected': return '❌'
    case 'system_update': return '🔄'
    case 'nhg_deviation_alert': return '⚠️'
    default: return '📢'
  }
}

export const getNotificationColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 border-red-300 text-red-800'
    case 'high': return 'bg-orange-100 border-orange-300 text-orange-800'
    case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'low': return 'bg-blue-100 border-blue-300 text-blue-800'
    default: return 'bg-gray-100 border-gray-300 text-gray-800'
  }
}