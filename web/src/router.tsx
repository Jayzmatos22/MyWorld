import { Navigate, createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TodayPage } from '@/pages/TodayPage'
import { DetailPage } from '@/pages/DetailPage'
import { GalleryPage } from '@/pages/GalleryPage'
import { RandomPage } from '@/pages/RandomPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { AboutPage } from '@/pages/AboutPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteError } from '@/pages/RouteError'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      // A entrada do site é o Sobre; replace evita que o "voltar" caia de novo no redirecionamento
      { index: true, element: <Navigate to="/sobre" replace /> },
      { path: 'hoje', element: <TodayPage /> },
      { path: 'placa/:date', element: <DetailPage /> },
      { path: 'galeria', element: <GalleryPage /> },
      { path: 'acaso', element: <RandomPage /> },
      { path: 'favoritos', element: <FavoritesPage /> },
      { path: 'sobre', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
