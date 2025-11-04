import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut, Menu, X, User, Home } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title: string
  showBack?: boolean
  serviceType?: 'daas' | 'cico'
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBack = false,
  serviceType = 'cico',
}) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMenuOpen(false)
  }

  const handleBack = () => {
    if (serviceType === 'cico') {
      navigate('/distributor/cico')
    } else {
      navigate('/distributor')
    }
  }

  const handleHome = () => {
    navigate('/services')
  }

  const goProfile = () => {
    setIsMenuOpen(false)
    navigate('/profile')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className='min-h-screen'>
      <header
        className='text-brand relative bg-brand
       border-b border-outline'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Left side - Back button and title */}
            <div className='flex items-center space-x-4 flex-1 min-w-0'>
              {showBack && (
                <Button
                  variant='ghost'
                  onClick={handleBack}
                  className='hover:text-gray-900 hidden sm:flex'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back
                </Button>
              )}
              {/* Mobile back button - icon only */}
              {showBack && (
                <Button
                  variant='ghost'
                  onClick={handleBack}
                  className='text-gray-600 hover:text-gray-900 sm:hidden p-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              )}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <h1 className='text-lg sm:text-xl font-medium truncate'>
                    {title}
                  </h1>
                </div>
              </div>
              {/* Home button */}
              <Button
                variant='ghost'
                onClick={handleHome}
                className='hidden sm:flex text-gray-600 hover:text-gray-900 p-2'
                title='Home'
              >
                <Home className='h-4 w-4' />
              </Button>

              {/* Profile button - hidden on xs (moved to hamburger menu for small devices) */}
              <Button
                variant='ghost'
                onClick={goProfile}
                className='hidden sm:flex flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2'
                title='User Profile'
              >
                <User className='h-4 w-4' />
                <span className='text-sm'>User Profile</span>
              </Button>
            </div>

            {/* Desktop service switch and logout */}
            <div className='hidden md:flex items-center space-x-2'>
              {/* Desktop profile button */}
              <Button
                variant='ghost'
                className='button flex items-center gap-2'
                onClick={goProfile}
              >
                <User className='h-4 w-4' />
                <span className='hidden lg:inline'>Profile</span>
              </Button>
              <Button variant='ghost' className='button' onClick={handleLogout}>
                <LogOut className='h-4 w-4' />
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className='md:hidden'>
              <Button
                variant='ghost'
                onClick={toggleMenu}
                className='text-brand hover:text-accent p-2'
                aria-label='Open menu'
              >
                {isMenuOpen ? (
                  <X className='h-5 w-5' />
                ) : (
                  <Menu className='h-5 w-5' />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className='md:hidden absolute top-full left-0 right-0 bg-surface shadow-lg z-50 border-b border-outline'>
            <div className='px-4 py-4 space-y-4'>
              {/* User info section */}
              <div className='flex items-center space-x-3 p-3 rounded-lg bg-brand'>
                <div className='bg-blue-100 p-2 rounded-full'>
                  <User className='h-4 w-4 text-blue-600' />
                </div>
              </div>

              {/* Menu actions */}
              <div className='space-y-2'>
                <Button
                  variant='ghost'
                  className='w-full justify-start text-brand hover:text-accent hover:bg-surface'
                  onClick={handleHome}
                >
                  <Home className='h-4 w-4 mr-2' />
                  Home
                </Button>

                <Button
                  variant='ghost'
                  className='w-full justify-start text-brand hover:text-accent hover:bg-surface'
                  onClick={() => {
                    goProfile()
                  }}
                >
                  <User className='h-4 w-4 mr-2' />
                  User Profile
                </Button>

                <Button
                  variant='ghost'
                  className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
                  onClick={handleLogout}
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Blur overlay to close menu when clicking outside */}
        {isMenuOpen && (
          <div
            className='fixed inset-0 backdrop-blur-sm bg-white/20 z-40 md:hidden'
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {children}
      </main>
    </div>
  )
}

export default Layout
