'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Phone, Shield } from 'lucide-react'
import logoSun from '@/assets/logos/logo2.svg'
import axios from 'axios'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/lib/use-toast'
import { AUTH_URL } from '../../api/config'



export default function AuthPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const { login, sessionToken, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4 bg-brand'>
        <p className='text-secondary'>Loading...</p>
      </div>
    )
  }

  if (sessionToken) {
    return null
  }

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(
        `${AUTH_URL}/v1/cico/agents/auth/request-otp`,
        {
          phone_number: phone,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(res)

      setStep('otp')
      toast({
        title: 'OTP Sent',
        description: 'A one-time code was sent to your phone.',
      })
    } catch {
      toast({
        title: 'Failed to send OTP',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Enter the 6-digit code sent to your phone.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Use centralized login from AuthContext
      await login(phone, otp)

      toast({
        title: 'Signed in',
        description: 'OTP verified successfully.',
      })
      navigate('/')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Login failed',
        description: 'Unable to sign in. Check the code and try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='rounded-lg p-6 w-full max-w-md space-y-8'>
        <Card className='bg-surface border shadow-2xl text-brand border-outline'>
          <CardHeader className='text-center'>
            <div className='text-center'>
              <div className='flex items-center justify-center mb-4'>
                <div className='rounded-sm p-3'>
                  <img alt='logo' src={logoSun} width={200} height={100} />
                </div>
              </div>
            </div>
            <CardTitle className='flex items-center justify-center gap-2'>
              {step === 'phone' ? (
                <Phone className='h-5 w-5' />
              ) : (
                <Shield className='h-5 w-5' />
              )}
              {step === 'phone' ? 'Sign In' : 'Verify OTP'}
            </CardTitle>
            <CardDescription className='text-gray-300'>
              {step === 'phone'
                ? 'Enter your phone number to get started'
                : 'Enter the 6-digit code sent to your phone'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {step === 'phone' ? (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='7XXX XXXX'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='text-center'
                  />
                </div>
                <Button
                  onClick={handleSendOTP}
                  className='w-full button font-semibold'
                  disabled={loading}
                  variant={'outline'}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='otp'>Verification Code</Label>
                  <Input
                    id='otp'
                    type='text'
                    placeholder='000000'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className='text-center text-2xl tracking-widest'
                    maxLength={6}
                  />
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='secondary'
                    onClick={() => setStep('phone')}
                    className='flex-1'
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    className='flex-1 button font-semibold'
                    disabled={loading}
                    variant={'outline'}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
