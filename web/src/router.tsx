import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TodayPage } from '@/pages/TodayPage'
import { DetailPage } from '@/pages/DetailPage'
import { GalleryPage } from '@/pages/GalleryPage'
import { RandomPage } from '@/pages/RandomPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteError } from '@/pages/RouteError'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'placa/:date', element: <DetailPage /> },
      { path: 'galeria', element: <GalleryPage /> },
      { path: 'acaso', element: <RandomPage /> },
      { path: 'favoritos', element: <FavoritesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
