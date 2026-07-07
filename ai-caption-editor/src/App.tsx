import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { AuthPage } from '@/pages/auth'
import { DashboardPage } from '@/pages/dashboard'
import { ProjectsPage } from '@/pages/projects'
import { NewProjectPage } from '@/pages/new-project'
import { SettingsPage } from '@/pages/settings'
import { ProfilePage } from '@/pages/profile'
import { HelpPage } from '@/pages/help'
import { TemplatesMarketplacePage } from '@/pages/templates'
import { EditorLayout } from '@/pages/editor'
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute, AnalyticsRoute } from '@/components/routing/route-guard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnalyticsRoute><LandingPage /></AnalyticsRoute>} />
        <Route path="/auth" element={<AnalyticsRoute><AuthPage /></AnalyticsRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <ProjectsPage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <NewProjectPage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <TemplatesMarketplacePage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <HelpPage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <AnalyticsRoute>
                <EditorLayout />
              </AnalyticsRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
