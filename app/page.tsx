'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { OptimizedImage } from './components/ui';
import { IdentityCard } from './components/ui/IdentityCard';
import { PasswordModal } from './components/ui/PasswordModal';
import { GuardianIcon, NunuIcon, FafaIcon, AmbassadorIcon, BardIcon } from './components/icons/RoleIcons';
import type { PasswordKey } from './types/password';

type Role = 'guardian' | 'nunu' | 'fafa' | 'ambassador' | 'bard';

interface RoleConfig {
  key: Role;
  title: string;
  subtitle: string;
  icon: ReactNode;
  path: string;
  needsPassword: boolean;
  isLocked?: boolean;
}

const roles: RoleConfig[] = [
  { key: 'guardian', title: '守護者', subtitle: '執行團隊', icon: <GuardianIcon />, path: '/guardian', needsPassword: true },
  { key: 'nunu', title: '努努', subtitle: '活動志工', icon: <NunuIcon />, path: '/nunu', needsPassword: true },
  { key: 'fafa', title: '法法', subtitle: '活動參與者', icon: <FafaIcon />, path: '/fafa', needsPassword: false, isLocked: true },
  { key: 'ambassador', title: '校園大使', subtitle: '新世代力量', icon: <AmbassadorIcon />, path: '/ambassador', needsPassword: true },
  { key: 'bard', title: '吟遊詩人', subtitle: '我也不知道我是誰', icon: <BardIcon />, path: '/recruit', needsPassword: false },
];

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [shakingCard, setShakingCard] = useState<Role | null>(null);
  const [showLockOverlay, setShowLockOverlay] = useState<Role | null>(null);

  const handleRoleClick = (role: RoleConfig) => {
    if (role.isLocked) {
      // Trigger shake animation and show lock overlay
      setShakingCard(role.key);
      setShowLockOverlay(role.key);
      setTimeout(() => setShakingCard(null), 500);
      setTimeout(() => setShowLockOverlay(null), 2000);
      return;
    }

    if (role.needsPassword) {
      setSelectedRole(role.key);
      setShowModal(true);
    } else {
      router.push(role.path);
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    const role = roles.find(r => r.key === selectedRole);
    if (role) {
      router.push(role.path);
    }
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
              isShaking={shakingCard === role.key}
              isLocked={role.isLocked}
              showLockOverlay={showLockOverlay === role.key}
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
      <PasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        roleKey={selectedRole as PasswordKey}
        onSuccess={handleSuccess}
      />
    </main>
  );
}
