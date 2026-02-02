'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OptimizedImage } from './components/ui';
import { IdentityCard } from './components/ui/IdentityCard';
import { PasswordModal } from './components/ui/PasswordModal';
import { GuardianIcon, NunuIcon, FafaIcon, AmbassadorIcon, BardIcon } from './components/icons/RoleIcons';
import { useAuth } from './hooks/useAuth';

type Role = 'guardian' | 'nunu' | 'fafa' | 'ambassador' | 'bard';

interface RoleConfig {
  key: Role;
  title: string;
  subtitle: string;
  icon: ReactNode;
  path: string;
  isLocked?: boolean;
  requiresPassword?: boolean;
}

const roles: RoleConfig[] = [
  { key: 'guardian', title: '守護者', subtitle: '執行團隊', icon: <GuardianIcon />, path: '/guardian', requiresPassword: true },
  { key: 'nunu', title: '努努', subtitle: '活動志工', icon: <NunuIcon />, path: '/nunu', requiresPassword: true },
  { key: 'fafa', title: '法法', subtitle: '活動參與者', icon: <FafaIcon />, path: '/fafa', requiresPassword: true },
  { key: 'ambassador', title: '校園大使', subtitle: '新世代力量', icon: <AmbassadorIcon />, path: '/ambassador', requiresPassword: true },
  { key: 'bard', title: '吟遊詩人', subtitle: '我也不知道我是誰', icon: <BardIcon />, path: '/recruit', requiresPassword: false },
];

export default function Home() {
  const router = useRouter();
  const { isVerified } = useAuth();
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    role: RoleConfig | null;
  }>({ isOpen: false, role: null });

  const handleRoleClick = (role: RoleConfig) => {
    if (role.isLocked) {
      return;
    }

    // Bard doesn't need password
    if (!role.requiresPassword) {
      router.push(role.path);
      return;
    }

    // Check if already verified
    if (isVerified(role.key)) {
      router.push(role.path);
      return;
    }

    // Show password modal
    setPasswordModal({ isOpen: true, role });
  };

  const handlePasswordSuccess = () => {
    if (passwordModal.role) {
      router.push(passwordModal.role.path);
    }
  };

  const handleCloseModal = () => {
    setPasswordModal({ isOpen: false, role: null });
  };

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="text-center mb-12 animate-fade-in-up animate-initial" style={{ animationFillMode: 'forwards' }}>
        <div className="flex justify-center mb-4">
          <OptimizedImage
            src="/nuva logo.png"
            alt="NUVA 校園計劃"
            width={100}
            height={100}
            className="object-contain"
            priority
            sizePreset="avatarLarge"
          />
        </div>
        <p className="text-text-secondary text-sm">
          請選擇你的身份
        </p>
      </div>

      {/* Identity Cards */}
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {roles.map((role, index) => (
            <IdentityCard
              key={role.key}
              title={role.title}
              subtitle={role.subtitle}
              icon={role.icon}
              onClick={() => handleRoleClick(role)}
              index={index}
              isLocked={role.isLocked}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-12 text-text-muted text-xs animate-fade-in-up animate-initial"
        style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
      >
        <span className="tracking-widest">NUVA</span>
      </div>

      {/* Password Modal */}
      {passwordModal.role && (
        <PasswordModal
          isOpen={passwordModal.isOpen}
          onClose={handleCloseModal}
          roleKey={passwordModal.role.key}
          roleTitle={passwordModal.role.title}
          onSuccess={handlePasswordSuccess}
        />
      )}
    </main>
  );
}
