'use client';

import React, { useState, useEffect } from 'react';
import { 
  OrderItem, 
  GiftCardBrand, 
  PlatformNotification, 
  PayoutMethod, 
  FaqItem, 
  LayoutSection, 
  SiteSettings,
  CustomPage,
  StaffMember
} from '@/lib/types';
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  RefreshCw, 
  ShieldCheck,
  Lock, 
  Unlock, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Power, 
  Bell, 
  AlertTriangle,
  Zap,
  Sliders,
  Plus, 
  Trash2,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  CreditCard,
  Building2,
  Layout,
  MessageSquare,
  Send,
  Edit2,
  FileText,
  Users,
  ExternalLink,
  Key,
  X
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<{ 
    orders: OrderItem[]; 
    brands: GiftCardBrand[]; 
    payoutRails: PayoutMethod[];
    faqs: FaqItem[];
    layoutSections: LayoutSection[];
    siteSettings: SiteSettings;
    notifications: PlatformNotification[]; 
    customPages?: CustomPage[];
    staff?: StaffMember[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'brands' | 'layout' | 'pages' | 'staff' | 'payouts' | 'faqs' | 'settings' | 'alerts'>('orders');
  
  // Rate edit state
  const [editingBrandId, setEditingBrandId] = useState<string>('');
  const [editingCountryCode, setEditingCountryCode] = useState<string>('');
  const [newEcodeRate, setNewEcodeRate] = useState<string>('');
  const [newPhysicalRate, setNewPhysicalRate] = useState<string>('');
  const [rateSaveSuccess, setRateSaveSuccess] = useState<string>('');

  // Add Brand Modal
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [brandFormName, setBrandFormName] = useState('');
  const [brandFormCategory, setBrandFormCategory] = useState<'Gaming' | 'Shopping' | 'Streaming' | 'Prepaid'>('Shopping');
  const [brandFormIcon, setBrandFormIcon] = useState('🎁');
  const [brandFormSpeed, setBrandFormSpeed] = useState('5-15 mins');
  const [brandFormBadge, setBrandFormBadge] = useState('Popular');

  // Add Country Modal
  const [selectedBrandForCountry, setSelectedBrandForCountry] = useState<string>('');
  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [countryCurrency, setCountryCurrency] = useState('');
  const [countryEcodeRate, setCountryEcodeRate] = useState('72');
  const [countryPhysicalRate, setCountryPhysicalRate] = useState('76');
  const [countryNominals, setCountryNominals] = useState('25, 50, 100, 200');

  // FAQ Form
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Payout Form
  const [payoutName, setPayoutName] = useState('');
  const [payoutSymbol, setPayoutSymbol] = useState('');
  const [payoutNetwork, setPayoutNetwork] = useState('');
  const [payoutIcon, setPayoutIcon] = useState('💳');
  const [payoutType, setPayoutType] = useState<'crypto' | 'fiat'>('crypto');
  const [payoutFee, setPayoutFee] = useState('0.00%');
  const [payoutMin, setPayoutMin] = useState('10');

  // Site Settings Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);

  // Chat message input per order
  const [orderChatInputs, setOrderChatInputs] = useState<{ [key: string]: string }>({});
  const [showCodes, setShowCodes] = useState<{ [key: string]: boolean }>({});
  const [viewingReceiptModal, setViewingReceiptModal] = useState<{ isOpen: boolean; image: string; title: string }>({ isOpen: false, image: '', title: '' });

  // Pages Builder Form State
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageSummary, setPageSummary] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [pageShowHeader, setPageShowHeader] = useState(false);
  const [pageShowFooter, setPageShowFooter] = useState(true);

  // Staff Sub-Accounts State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'SUPER_ADMIN' | 'OPERATOR' | 'FINANCE' | 'SUPPORT'>('OPERATOR');

  const [sessionToken, setSessionToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('cb_vault_session') || '';
    }
    return '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(sessionStorage.getItem('cb_vault_session'));
    }
    return false;
  });
  const [authError, setAuthError] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Progressive Two-Stage Authentication State
  const [authStage, setAuthStage] = useState<1 | 2>(1);
  const [challengeToken, setChallengeToken] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(90);
  const [certifySession, setCertifySession] = useState<boolean>(false);

  // Stage 2 Expiration Timer (90s window)
  useEffect(() => {
    let timer: any;
    if (authStage === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setAuthStage(1);
            setChallengeToken('');
            setPinInput('');
            setAuthErrorMessage('Security challenge expired (90s window). Please re-verify Master Key.');
            return 90;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStage, countdown]);

  const adminFetch = async (url: string = '/api/admin', options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('cb_vault_session') || sessionToken) : sessionToken;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      setAuthError(true);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cb_vault_session');
      }
    }
    return res;
  };

  // Stage 1: Verify Master Secret Key
  const handleStage1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const mKey = keyInput.trim();
    if (!mKey) {
      setAuthErrorMessage('Stage 1 Failure: Master Access Key is strictly required.');
      return;
    }

    setIsVerifying(true);
    setAuthErrorMessage('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 1, masterKey: mKey })
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Stage 1 Verification Failed.');
      }

      setChallengeToken(json.challengeToken);
      setAuthStage(2);
      setCountdown(90);
      setPinInput('');
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'Stage 1 authentication error.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Stage 2: Verify Operator PIN & Issue Cryptographic Session Token
  const handleStage2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const sPin = pinInput.trim();
    if (!sPin) {
      setAuthErrorMessage('Stage 2 Failure: 6-Digit PIN is required.');
      return;
    }
    if (!certifySession) {
      setAuthErrorMessage('Please confirm the authorized session audit acknowledgment.');
      return;
    }

    setIsVerifying(true);
    setAuthErrorMessage('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 2,
          challengeToken,
          securityPin: sPin
        })
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Stage 2 Verification Failed.');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cb_vault_session', json.token);
      }
      setSessionToken(json.token);
      setIsAuthenticated(true);
      setAuthError(false);
      setKeyInput('');
      setPinInput('');
      setChallengeToken('');
      setAuthStage(1);
      setTimeout(() => {
        fetchData();
      }, 100);
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'Stage 2 authentication error.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLock = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cb_vault_session');
    }
    setSessionToken('');
    setIsAuthenticated(false);
    setAuthError(true);
    setData(null);
    setAuthStage(1);
    setChallengeToken('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin');
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        if (json.data.siteSettings) {
          setSettingsForm(json.data.siteSettings);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Order Actions with Strict Multi-Stage Protection
  const handleUpdateStatus = async (orderId: string, status: OrderItem['status']) => {
    let rejectionReason: string | undefined = undefined;
    let txHash: string | undefined = undefined;
    let adminPin: string | undefined = undefined;

    const targetOrder = data?.orders.find(o => o.id === orderId);

    if (status === 'COMPLETED') {
      if (targetOrder && targetOrder.status !== 'VERIFYING') {
        alert('SECURITY VIOLATION: You must complete Stage 1 (Card & Balance Inspection) before releasing Stage 2 payout settlement.');
        return;
      }

      const pin = prompt('SECURITY STAGE 2 DUAL-CONFIRMATION:\nEnter your 6-Digit Admin Security PIN to authorize this financial payout:');
      if (!pin?.trim()) {
        alert('Payout authorization cancelled: 6-Digit Admin PIN is strictly required.');
        return;
      }
      adminPin = pin.trim();

      const hash = prompt('Enter Blockchain Payout TxHash / Settlement Reference (Mandatory):');
      if (!hash?.trim()) {
        alert('Payout authorization cancelled: Settlement reference / TxHash is mandatory.');
        return;
      }
      txHash = hash.trim();
    } else if (status === 'REJECTED') {
      const reason = prompt('Enter official rejection reason for platform audit log:', 'Card invalid, already redeemed, or incorrect country');
      if (!reason?.trim()) {
        alert('Rejection cancelled: Audit reason is strictly required.');
        return;
      }
      rejectionReason = reason.trim();
    }

    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orderId,
          status,
          rejectionReason,
          txHash,
          adminPin
        })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Failed to update order status');
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleSendOrderMessage = async (orderId: string) => {
    const msg = orderChatInputs[orderId];
    if (!msg?.trim()) return;

    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_order_message',
          orderId,
          message: msg.trim()
        })
      });
      const json = await res.json();
      if (json.ok) {
        setOrderChatInputs(prev => ({ ...prev, [orderId]: '' }));
        fetchData();
      }
    } catch {
      alert('Failed to send message');
    }
  };

  // Reorder Brand (Card Positions)
  const handleReorderBrand = async (brandId: string, direction: 'UP' | 'DOWN') => {
    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder_brand', brandId, direction })
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch {
      alert('Failed to reorder card position');
    }
  };

  // Assign Order to Sub-Account / Staff
  const handleAssignOrder = async (orderId: string, staffId: string) => {
    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_order', orderId, staffId })
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch {
      alert('Failed to assign operator');
    }
  };

  // Custom Pages CMS (WordPress/Shopify style)
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanSlug = pageSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      if (editingPageId) {
        await adminFetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_page',
            pageId: editingPageId,
            updates: {
              title: pageTitle,
              slug: cleanSlug,
              summary: pageSummary,
              content: pageContent,
              published: pagePublished,
              showInHeader: pageShowHeader,
              showInFooter: pageShowFooter
            }
          })
        });
      } else {
        await adminFetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_page',
            page: {
              title: pageTitle,
              slug: cleanSlug,
              summary: pageSummary,
              content: pageContent,
              published: pagePublished,
              showInHeader: pageShowHeader,
              showInFooter: pageShowFooter
            }
          })
        });
      }
      setShowPageModal(false);
      resetPageForm();
      fetchData();
    } catch {
      alert('Failed to save page');
    }
  };

  const handleEditPage = (page: CustomPage) => {
    setEditingPageId(page.id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageSummary(page.summary || '');
    setPageContent(page.content);
    setPagePublished(page.published);
    setPageShowHeader(page.showInHeader);
    setPageShowFooter(page.showInFooter);
    setShowPageModal(true);
  };

  const resetPageForm = () => {
    setEditingPageId(null);
    setPageTitle('');
    setPageSlug('');
    setPageSummary('');
    setPageContent('');
    setPagePublished(true);
    setPageShowHeader(false);
    setPageShowFooter(true);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this custom page?')) return;
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_page', pageId })
      });
      fetchData();
    } catch {
      alert('Failed to delete page');
    }
  };

  const handleTogglePage = async (pageId: string) => {
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_page', pageId })
      });
      fetchData();
    } catch {
      alert('Failed to toggle page status');
    }
  };

  // Staff Sub-Account Handlers
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_staff',
          staff: {
            name: staffName,
            email: staffEmail,
            role: staffRole,
            active: true
          }
        })
      });
      setShowStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      setStaffRole('OPERATOR');
      fetchData();
    } catch {
      alert('Failed to add staff member');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff sub-account?')) return;
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_staff', staffId })
      });
      fetchData();
    } catch {
      alert('Failed to delete staff member');
    }
  };

  const handleToggleStaffStatus = async (staffId: string, currentActive: boolean) => {
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_staff',
          staffId,
          updates: { active: !currentActive }
        })
      });
      fetchData();
    } catch {
      alert('Failed to update staff status');
    }
  };

  // 2. Brand CRUD
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_brand',
          name: brandFormName,
          category: brandFormCategory,
          icon: brandFormIcon,
          badge: brandFormBadge,
          verificationTime: brandFormSpeed
        })
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddBrandModal(false);
        setBrandFormName('');
        fetchData();
      }
    } catch {
      alert('Failed to create brand');
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this gift card brand?')) return;
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_brand', brandId })
      });
      fetchData();
    } catch {
      alert('Failed to delete brand');
    }
  };

  const handleToggleBrand = async (brandId: string) => {
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_brand', brandId })
      });
      fetchData();
    } catch {
      alert('Failed to toggle brand status');
    }
  };

  const handleSaveRates = async (brandId: string, countryCode: string) => {
    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_rate',
          brandId,
          countryCode,
          ecodeRate: parseFloat(newEcodeRate),
          physicalRate: parseFloat(newPhysicalRate)
        })
      });
      const json = await res.json();
      if (json.ok) {
        setRateSaveSuccess(`Updated ${countryCode} rates!`);
        setTimeout(() => setRateSaveSuccess(''), 3000);
        setEditingBrandId('');
        fetchData();
      }
    } catch {
      alert('Failed to save rate');
    }
  };

  const handleAddCountryToBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandForCountry) return;

    const nominalArr = countryNominals.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_country',
          brandId: selectedBrandForCountry,
          country: {
            code: countryCode.toUpperCase().trim(),
            name: countryName.trim(),
            flag: countryFlag.trim(),
            currency: countryCurrency.toUpperCase().trim(),
            ratePercent: parseFloat(countryEcodeRate),
            rateEcode: parseFloat(countryEcodeRate),
            ratePhysical: parseFloat(countryPhysicalRate),
            nominals: nominalArr.length ? nominalArr : [25, 50, 100]
          }
        })
      });
      const json = await res.json();
      if (json.ok) {
        setSelectedBrandForCountry('');
        fetchData();
      }
    } catch {
      alert('Failed to add region');
    }
  };

  // 3. Layout Reorder
  const handleMoveSection = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!data?.layoutSections) return;
    const current = [...data.layoutSections];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;

    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_layout', sections: current })
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } catch {
      alert('Failed to update section order');
    }
  };

  const handleToggleSection = async (index: number) => {
    if (!data?.layoutSections) return;
    const current = [...data.layoutSections];
    current[index].enabled = !current[index].enabled;

    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_layout', sections: current })
      });
      fetchData();
    } catch {
      alert('Failed to toggle section');
    }
  };

  // 4. Payout Rails CRUD
  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payout',
          rail: {
            id: payoutName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: payoutName,
            symbol: payoutSymbol || payoutName,
            network: payoutNetwork,
            icon: payoutIcon,
            type: payoutType,
            fee: payoutFee,
            minPayout: parseFloat(payoutMin) || 10,
            enabled: true
          }
        })
      });
      setPayoutName('');
      fetchData();
    } catch {
      alert('Failed to add payout rail');
    }
  };

  const handleDeletePayout = async (id: string) => {
    if (!confirm('Delete payout rail?')) return;
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_payout', id })
      });
      fetchData();
    } catch {
      alert('Failed to delete payout rail');
    }
  };

  // 5. FAQ CRUD
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_faq', question: newFaqQ, answer: newFaqA })
      });
      setNewFaqQ('');
      setNewFaqA('');
      fetchData();
    } catch {
      alert('Failed to add FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_faq', id })
      });
      fetchData();
    } catch {
      alert('Failed to delete FAQ');
    }
  };

  // 6. Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await adminFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_settings', settings: settingsForm })
      });
      const json = await res.json();
      if (json.ok) {
        alert('Settings saved successfully!');
        fetchData();
      }
    } catch {
      alert('Failed to save settings');
    }
  };

  if (!isAuthenticated || authError) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-brand-border shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mx-auto flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold uppercase tracking-wider mb-3">
            Defensive Security: Two-Stage Verification Vault
          </div>

          {authStage === 1 ? (
            <>
              <h2 className="text-2xl font-black text-brand-text tracking-tight mb-2">Stage 1: Master Key Clearance</h2>
              <p className="text-xs text-brand-muted leading-relaxed mb-6">
                Step 1 of 2. Enter Operator Master Passphrase. Hardened rate-limiting & lockout protocols active.
              </p>

              {authErrorMessage && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium text-left">
                  ⚠️ {authErrorMessage}
                </div>
              )}

              <form onSubmit={handleStage1} className="space-y-4 text-left">
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                    Operator Master Secret Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Master Secret Passphrase..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm font-mono focus:border-brand-primary outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying Stage 1...' : 'Proceed to Stage 2 Challenge →'}</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-brand-text tracking-tight mb-2">Stage 2: Secondary PIN Challenge</h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 font-mono font-bold mb-4 bg-amber-500/10 py-1 px-3 rounded-full border border-amber-500/20 w-fit mx-auto">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Challenge Active (Expires in {countdown}s)</span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed mb-6">
                Step 2 of 2. Stage 1 passed. Enter your 6-Digit Operator Security PIN to release cryptographic session key.
              </p>

              {authErrorMessage && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium text-left">
                  ⚠️ {authErrorMessage}
                </div>
              )}

              <form onSubmit={handleStage2} className="space-y-4 text-left">
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                    6-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm font-mono tracking-widest focus:border-brand-primary outline-none transition-all text-center"
                    required
                    autoFocus
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={certifySession}
                    onChange={(e) => setCertifySession(e.target.checked)}
                    className="mt-0.5 rounded text-brand-primary focus:ring-brand-primary"
                    required
                  />
                  <span className="text-[11px] text-brand-muted leading-tight">
                    I verify authorized administrative access under system audit logging rules.
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStage(1);
                      setChallengeToken('');
                      setAuthErrorMessage('');
                    }}
                    className="px-4 py-3.5 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-muted text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isVerifying ? 'Finalizing Clearance...' : 'Verify PIN & Unlock Desk'}</span>
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-brand-border/60 text-[10px] text-brand-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
            <span>2-Stage Zero-Trust Vault • 5 Strikes = 15m IP Quarantine</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-brand-muted text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-brand-primary" />
        <span>Loading Control Center...</span>
      </div>
    );
  }

  const totalVolume = data.orders.reduce((acc, o) => acc + o.totalCardValue, 0);
  const pendingCount = data.orders.filter(o => o.status === 'PENDING' || o.status === 'VERIFYING').length;
  const completedCount = data.orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-brand-border/60 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5" />
            Cardbyte Headless CMS & Operations Desk
          </div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Complete Backend Control Center</h1>
          <p className="text-sm text-brand-muted mt-1">
            Rebuild pages, reposition layout sections, manage brands, payout rails, FAQs, and release trade payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-primary" /> Refresh
          </button>
          <button
            onClick={handleLock}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Desk
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-brand-border shadow-card">
          <span className="text-xs text-brand-muted block font-semibold">Total Orders</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-brand-text mt-1 block">{data.orders.length}</span>
          <span className="text-xs text-brand-success mt-1 block font-medium">Vol: ${totalVolume.toFixed(2)}</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 shadow-card">
          <span className="text-xs text-amber-500 block font-semibold">Pending Verification</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-amber-500 mt-1 block">{pendingCount}</span>
          <span className="text-xs text-brand-muted mt-1 block">Awaiting check</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-brand-success/30 bg-brand-success/5 shadow-card">
          <span className="text-xs text-brand-success block font-semibold">Completed Trades</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-brand-success mt-1 block">{completedCount}</span>
          <span className="text-xs text-brand-muted mt-1 block">Payouts released</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-blue-500/30 bg-blue-500/5 shadow-card">
          <span className="text-xs text-blue-500 block font-semibold">Catalog Inventory</span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-blue-500 mt-1 block">
            {data.brands.filter(b => b.enabled !== false).length} / {data.brands.length}
          </span>
          <span className="text-xs text-brand-muted mt-1 block">Active cards</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border mb-8 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'orders' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Orders Desk ({data.orders.length})
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'brands' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Brands & Rates CMS ({data.brands.length})
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'layout' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Homepage Sections Order</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pages' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pages Builder CMS ({data.customPages?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Sub-Accounts ({data.staff?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'payouts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payout Rails ({data.payoutRails?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'faqs' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Site Settings & Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'alerts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-brand-primary" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ORDERS DESK */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-surface border-b border-brand-border text-xs uppercase text-brand-muted tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Tracking Code</th>
                    <th className="py-4 px-5">Card & Format</th>
                    <th className="py-4 px-5">Customer Codes / PIN</th>
                    <th className="py-4 px-5">Payout Amount</th>
                    <th className="py-4 px-5">Destination Address</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Assigned Operator</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-brand-text">
                  {data.orders.map((o) => {
                    const isRevealed = showCodes[o.id] || false;
                    return (
                      <React.Fragment key={o.id}>
                        <tr className="hover:bg-brand-surface/70 transition-colors">
                          <td className="py-4 px-5 whitespace-nowrap font-mono font-bold text-brand-primary">
                            {o.trackingCode}
                          </td>

                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className="font-bold text-brand-text block">{o.brandName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-brand-muted">
                                {o.quantity}x ${o.nominal} ({o.ratePercent}%)
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                o.cardType === 'PCARD' 
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                  : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              }`}>
                                {o.cardType === 'PCARD' ? 'Physical' : 'E-Code'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-brand-surface px-2.5 py-1 rounded border border-brand-border text-brand-text">
                                {isRevealed ? o.cardCodes.join(', ') : '•••• •••• ••••'}
                                {o.cardPin ? ` (PIN: ${isRevealed ? o.cardPin : '•••'})` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowCodes(prev => ({ ...prev, [o.id]: !isRevealed }))}
                                className="text-brand-muted hover:text-brand-primary p-1 cursor-pointer"
                                title="Toggle reveal"
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {o.receiptNote && (
                              <span className="text-[11px] text-brand-muted block mt-1">Note: {o.receiptNote}</span>
                            )}
                            {o.receiptImages && o.receiptImages.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setViewingReceiptModal({
                                  isOpen: true,
                                  image: o.receiptImages[0],
                                  title: `Order #${o.trackingCode} - Attached Receipt / Card Photo`
                                })}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline mt-1.5 cursor-pointer bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/25"
                              >
                                <FileText className="w-3 h-3" /> View Receipt Image
                              </button>
                            )}
                          </td>

                          <td className="py-4 px-5 whitespace-nowrap font-mono font-extrabold text-brand-success">
                            ${o.payoutAmount.toFixed(2)} USD
                          </td>

                          <td className="py-4 px-5 whitespace-nowrap text-xs font-mono text-brand-muted max-w-[180px] truncate" title={o.payoutAddress}>
                            {o.payoutAddress}
                          </td>

                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                              o.status === 'COMPLETED'
                                ? 'bg-brand-successGlow text-brand-success border border-brand-success/40'
                                : o.status === 'REJECTED'
                                ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                                : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            }`}>
                              {o.status}
                            </span>
                          </td>

                          <td className="py-4 px-5 whitespace-nowrap">
                            <select
                              value={o.assignedToStaffId || ''}
                              onChange={(e) => handleAssignOrder(o.id, e.target.value)}
                              className="bg-brand-surface border border-brand-border rounded-xl px-2.5 py-1.5 text-xs text-brand-text font-semibold focus:outline-none focus:border-brand-primary cursor-pointer"
                            >
                              <option value="">Unassigned</option>
                              {(data.staff || []).map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.role})
                                </option>
                              ))}
                            </select>
                            {o.assignedToStaffName && (
                              <span className="block text-[10px] text-brand-muted mt-0.5 font-mono">
                                Operator: {o.assignedToStaffName}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                            {o.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'VERIFYING')}
                                className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                title="Stage 1: Verify Card Codes & Balance Legitimacy"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Stage 1: Check Card</span>
                              </button>
                            )}

                            {o.status === 'VERIFYING' && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'COMPLETED')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-600 hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                title="Stage 2: Dual PIN Authorization Required to Release Payout"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Stage 2: Authorize Payout</span>
                              </button>
                            )}

                            {o.status === 'COMPLETED' && (
                              <span className="text-xs font-bold text-emerald-600 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Paid & Settled
                              </span>
                            )}

                            {o.status !== 'REJECTED' && o.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, 'REJECTED')}
                                className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                title="Reject Trade with Mandatory Audit Reason"
                              >
                                Reject
                              </button>
                            )}

                            {o.status === 'REJECTED' && (
                              <span className="text-xs font-bold text-red-500 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                Rejected
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Order Inline Chat / Support Row */}
                        <tr className="bg-brand-surface/30">
                          <td colSpan={8} className="px-5 py-3 border-b border-brand-border/40">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                                <span className="font-semibold text-brand-text">Order Chat History:</span>
                                <span className="text-brand-muted">
                                  {o.messages?.length || 0} messages exchanged with client
                                </span>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Reply directly to customer..."
                                  value={orderChatInputs[o.id] || ''}
                                  onChange={(e) => setOrderChatInputs({ ...orderChatInputs, [o.id]: e.target.value })}
                                  className="flex-1 sm:w-64 bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1 text-xs text-brand-text focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSendOrderMessage(o.id)}
                                  className="px-2.5 py-1 rounded-lg bg-brand-primary text-white text-xs font-bold cursor-pointer"
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BRANDS & RATES CMS */}
      {/* ======================================================== */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-brand-text">Gift Card Brands & Pricing Catalog</h3>
              <p className="text-xs text-brand-muted">Add brands, configure regional nominals, and adjust E-Code & Physical rates.</p>
            </div>
            <button
              onClick={() => setShowAddBrandModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Brand</span>
            </button>
          </div>

          {rateSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-brand-successGlow border border-brand-success/40 text-brand-success text-xs font-bold">
              {rateSaveSuccess}
            </div>
          )}

          {/* Add Brand Modal Form */}
          {showAddBrandModal && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-bold text-sm text-brand-text">Create New Gift Card Asset</span>
                <button onClick={() => setShowAddBrandModal(false)} className="text-xs text-brand-muted hover:text-brand-text">✕</button>
              </div>

              <form onSubmit={handleCreateBrand} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sephora, Nike, Best Buy"
                    value={brandFormName}
                    onChange={(e) => setBrandFormName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Category</label>
                  <select
                    value={brandFormCategory}
                    onChange={(e) => setBrandFormCategory(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  >
                    <option value="Shopping">Shopping</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🛍️ or 👟"
                    value={brandFormIcon}
                    onChange={(e) => setBrandFormIcon(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Verification Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5-15 mins"
                    value={brandFormSpeed}
                    onChange={(e) => setBrandFormSpeed(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Hot, Instant, Popular"
                    value={brandFormBadge}
                    onChange={(e) => setBrandFormBadge(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
                  >
                    Save & Create Brand
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Country Form Modal */}
          {selectedBrandForCountry && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-bold text-sm text-brand-text">
                  Add Country Region to {data.brands.find(b => b.id === selectedBrandForCountry)?.name}
                </span>
                <button onClick={() => setSelectedBrandForCountry('')} className="text-xs text-brand-muted">✕</button>
              </div>

              <form onSubmit={handleAddCountryToBrand} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Country Code</label>
                  <input
                    type="text"
                    required
                    placeholder="US, UK, CA, EU"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Country Name</label>
                  <input
                    type="text"
                    required
                    placeholder="United States"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Flag Emoji</label>
                  <input
                    type="text"
                    required
                    placeholder="🇺🇸"
                    value={countryFlag}
                    onChange={(e) => setCountryFlag(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Currency Code</label>
                  <input
                    type="text"
                    required
                    placeholder="USD, GBP, EUR"
                    value={countryCurrency}
                    onChange={(e) => setCountryCurrency(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">E-Code Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={countryEcodeRate}
                    onChange={(e) => setCountryEcodeRate(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Physical Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={countryPhysicalRate}
                    onChange={(e) => setCountryPhysicalRate(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-brand-muted mb-1 font-semibold">Nominals (comma separated)</label>
                  <input
                    type="text"
                    value={countryNominals}
                    onChange={(e) => setCountryNominals(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                  />
                </div>

                <div className="col-span-2 sm:col-span-4 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
                  >
                    Add Region to Catalog
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Brands List */}
          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card divide-y divide-brand-border/40">
            {data.brands.map((b, bIdx) => {
              const isBrandEnabled = b.enabled !== false;
              return (
                <div key={b.id} className={`p-6 flex flex-col gap-4 ${!isBrandEnabled ? 'opacity-60 bg-brand-surface/20' : ''}`}>
                  
                  {/* Brand Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-muted">
                          #{b.order || (bIdx + 1)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={bIdx === 0}
                            onClick={() => handleReorderBrand(b.id, 'UP')}
                            className="p-1 rounded bg-brand-surface border border-brand-border hover:bg-brand-primary/10 hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                            title="Move Card Up (Show Earlier)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={bIdx === data.brands.length - 1}
                            onClick={() => handleReorderBrand(b.id, 'DOWN')}
                            className="p-1 rounded bg-brand-surface border border-brand-border hover:bg-brand-primary/10 hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                            title="Move Card Down (Show Later)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-3xl p-2 rounded-xl bg-brand-surface border border-brand-border">{b.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-brand-text">{b.name}</h4>
                          <span className="text-xs text-brand-muted">({b.category}) • Speed: {b.verificationTime}</span>
                        </div>
                        <span className="text-xs text-brand-muted">ID: {b.id} • Regions: {b.countries.length} • Position Slot: #{b.order || (bIdx + 1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBrandForCountry(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-xs font-semibold text-brand-text cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Country</span>
                      </button>

                      <button
                        onClick={() => handleToggleBrand(b.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isBrandEnabled
                            ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                            : 'bg-red-500/15 border-red-500/30 text-red-500'
                        }`}
                      >
                        {isBrandEnabled ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleDeleteBrand(b.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/15 cursor-pointer"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Countries Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {b.countries.map((c) => {
                      const isEditing = editingBrandId === b.id && editingCountryCode === c.code;
                      const ecode = c.rateEcode !== undefined ? c.rateEcode : (c.ratePercent || 70);
                      const physical = c.ratePhysical !== undefined ? c.ratePhysical : (ecode + 4.5);

                      return (
                        <div key={c.code} className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
                            <span className="font-bold text-brand-text flex items-center gap-1">
                              <span>{c.flag}</span>
                              <span>{c.name} ({c.code})</span>
                            </span>
                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingBrandId(b.id);
                                  setEditingCountryCode(c.code);
                                  setNewEcodeRate(ecode.toString());
                                  setNewPhysicalRate(physical.toString());
                                }}
                                className="text-[11px] text-brand-primary hover:underline font-bold cursor-pointer"
                              >
                                Edit Rates
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-brand-muted">E-Code %:</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={newEcodeRate}
                                  onChange={(e) => setNewEcodeRate(e.target.value)}
                                  className="w-14 bg-brand-bg text-brand-primary font-bold px-1.5 py-0.5 rounded border border-brand-primary text-xs"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-brand-muted">Physical %:</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={newPhysicalRate}
                                  onChange={(e) => setNewPhysicalRate(e.target.value)}
                                  className="w-14 bg-brand-bg text-brand-success font-bold px-1.5 py-0.5 rounded border border-brand-success text-xs"
                                />
                              </div>
                              <div className="flex gap-1 pt-1">
                                <button
                                  onClick={() => handleSaveRates(b.id, c.code)}
                                  className="flex-1 py-1 rounded bg-brand-success text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingBrandId('')}
                                  className="px-2 py-1 rounded border border-brand-border text-brand-muted text-[11px] cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 pt-0.5">
                              <div className="flex justify-between">
                                <span className="text-brand-muted">E-Code:</span>
                                <span className="font-mono font-bold text-brand-primary">{ecode}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brand-muted">Physical:</span>
                                <span className="font-mono font-extrabold text-brand-success">{physical}%</span>
                              </div>
                              <div className="text-[10px] text-brand-muted pt-1 truncate">
                                Nominals: {c.nominals.map(n => `$${n}`).join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HOMEPAGE SECTIONS & REORDERING CMS */}
      {/* ======================================================== */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-brand-text">Homepage Layout Order & Section Visibility</h3>
            <p className="text-xs text-brand-muted">
              Reorder or hide sections on the homepage. Changes immediately reflect in real-time.
            </p>
          </div>

          <div className="space-y-3">
            {data.layoutSections.map((sec, idx) => (
              <div 
                key={sec.id} 
                className={`p-4 rounded-2xl glass-panel border border-brand-border shadow-sm flex items-center justify-between gap-4 transition-all ${
                  !sec.enabled ? 'opacity-50 bg-brand-surface/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-brand-text">{sec.name}</h4>
                    <p className="text-xs text-brand-muted">{sec.description || `Section ID: ${sec.id}`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, 'UP')}
                    className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    disabled={idx === data.layoutSections.length - 1}
                    onClick={() => handleMoveSection(idx, 'DOWN')}
                    className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleSection(idx)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      sec.enabled
                        ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                        : 'bg-red-500/15 border-red-500/30 text-red-500'
                    }`}
                  >
                    {sec.enabled ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: PAGES BUILDER CMS (WordPress & Shopify Style) */}
      {/* ======================================================== */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Headless CMS Pages Engine</span>
              </div>
              <h3 className="text-lg font-bold text-brand-text">Custom Pages & Legal Policies</h3>
              <p className="text-xs text-brand-muted">
                Create and publish new dynamic pages instantly with markdown formatting and custom URLs (/p/[slug]).
              </p>
            </div>
            <button
              onClick={() => {
                resetPageForm();
                setShowPageModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Page</span>
            </button>
          </div>

          {/* Modal / Create or Edit Form */}
          {showPageModal && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-bold text-sm text-brand-text">
                  {editingPageId ? 'Edit Custom Page' : 'Create New Custom Page'}
                </span>
                <button
                  onClick={() => setShowPageModal(false)}
                  className="text-xs text-brand-muted hover:text-brand-text cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePage} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-muted mb-1 font-semibold">Page Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Terms of Service, Career, Affiliate Guide"
                      value={pageTitle}
                      onChange={(e) => {
                        setPageTitle(e.target.value);
                        if (!editingPageId) {
                          setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                        }
                      }}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-muted mb-1 font-semibold">
                      URL Slug <span className="text-[11px] font-mono text-brand-primary">(Renders at /p/[slug])</span>
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-brand-surface border border-r-0 border-brand-border rounded-l-xl text-brand-muted font-mono text-xs">
                        /p/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. about-us, privacy-policy"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border rounded-r-xl px-3.5 py-2.5 text-brand-text font-mono text-sm focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Short Summary (Sub-Header)</label>
                  <input
                    type="text"
                    placeholder="Brief description or teaser displayed under title"
                    value={pageSummary}
                    onChange={(e) => setPageSummary(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2 text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-brand-muted font-semibold">
                      Page Content (Supports Markdown: # Heading, ## Subheading, **Bold**, * Bullet lists)
                    </label>
                    <span className="text-[11px] text-brand-muted font-mono">Markdown & Plain Text</span>
                  </div>
                  <textarea
                    required
                    rows={10}
                    placeholder="Write page content here... Supports standard markdown headings, paragraphs, and list items."
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl p-3.5 text-brand-text font-mono text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-brand-text">
                    <input
                      type="checkbox"
                      checked={pagePublished}
                      onChange={(e) => setPagePublished(e.target.checked)}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="font-semibold">Publish Immediately (Visible to Public)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-brand-text">
                    <input
                      type="checkbox"
                      checked={pageShowHeader}
                      onChange={(e) => setPageShowHeader(e.target.checked)}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span>Show link in Top Navbar</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-brand-text">
                    <input
                      type="checkbox"
                      checked={pageShowFooter}
                      onChange={(e) => setPageShowFooter(e.target.checked)}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span>Show link in Footer</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-brand-border">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold cursor-pointer transition-all shadow-sm"
                  >
                    {editingPageId ? 'Save Changes' : 'Create & Publish Page'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPageModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-muted hover:text-brand-text text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pages Table */}
          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-surface border-b border-brand-border text-xs uppercase text-brand-muted tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Page Title</th>
                    <th className="py-4 px-5">Public Path</th>
                    <th className="py-4 px-5">Placement</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Last Updated</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-brand-text">
                  {(data.customPages || []).map((page) => (
                    <tr key={page.id} className="hover:bg-brand-surface/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-brand-text">{page.title}</div>
                        {page.summary && (
                          <div className="text-xs text-brand-muted line-clamp-1">{page.summary}</div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <a
                          href={`/p/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs text-brand-primary hover:underline"
                        >
                          <span>/p/{page.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {page.showInHeader && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                              Header
                            </span>
                          )}
                          {page.showInFooter && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                              Footer
                            </span>
                          )}
                          {!page.showInHeader && !page.showInFooter && (
                            <span className="text-[10px] text-brand-muted">Direct Link Only</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleTogglePage(page.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                            page.published
                              ? 'bg-brand-successGlow text-brand-success border-brand-success/40'
                              : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                          }`}
                        >
                          {page.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-xs text-brand-muted">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="px-2.5 py-1 rounded-lg bg-brand-surface hover:bg-brand-cardHover border border-brand-border text-brand-text text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: SUB-ACCOUNTS & STAFF (RBAC) */}
      {/* ======================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Multi-Operator & Role-Based Access Control</span>
              </div>
              <h3 className="text-lg font-bold text-brand-text">Staff Sub-Accounts & Desk Operators</h3>
              <p className="text-xs text-brand-muted">
                Create team accounts for card verification, finance settlement, and customer support. Assign customer trades to specific team operators.
              </p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sub-Account</span>
            </button>
          </div>

          {/* Add Staff Modal */}
          {showStaffModal && (
            <div className="p-6 rounded-3xl glass-panel border border-brand-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-bold text-sm text-brand-text">Create Team Member / Sub-Account</span>
                <button
                  onClick={() => setShowStaffModal(false)}
                  className="text-xs text-brand-muted hover:text-brand-text cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Staff Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@cardbyte.io"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-brand-muted mb-1 font-semibold">Assigned Role</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none focus:border-brand-primary"
                  >
                    <option value="OPERATOR">Desk Operator (Card Verification)</option>
                    <option value="FINANCE">Finance Officer (Payout Release)</option>
                    <option value="SUPPORT">Support Agent (Live Dispute Support)</option>
                    <option value="SUPER_ADMIN">Super Administrator (Full System Access)</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-3 flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold cursor-pointer transition-all shadow-sm"
                  >
                    Create Sub-Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStaffModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-muted text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Staff Table */}
          <div className="rounded-3xl glass-panel border border-brand-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-surface border-b border-brand-border text-xs uppercase text-brand-muted tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Staff Member</th>
                    <th className="py-4 px-5">Work Email</th>
                    <th className="py-4 px-5">Role Permission</th>
                    <th className="py-4 px-5">Active Trades</th>
                    <th className="py-4 px-5">Account Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-brand-text">
                  {(data.staff || []).map((member) => {
                    const roleBadgeColor = {
                      SUPER_ADMIN: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
                      OPERATOR: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                      FINANCE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      SUPPORT: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }[member.role] || 'bg-brand-surface text-brand-text';

                    return (
                      <tr key={member.id} className="hover:bg-brand-surface/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-bold text-brand-primary text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-bold text-brand-text">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-xs text-brand-muted">
                          {member.email}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${roleBadgeColor}`}>
                            {member.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-xs">
                          {member.assignedOrdersCount || 0} assigned
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleStaffStatus(member.id, member.active)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                              member.active
                                ? 'bg-brand-successGlow text-brand-success border-brand-success/40'
                                : 'bg-red-500/15 text-red-500 border-red-500/30'
                            }`}
                          >
                            {member.active ? 'Active' : 'Suspended'}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/15 cursor-pointer"
                            title="Remove Sub-Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PAYOUT RAILS CMS */}
      {/* ======================================================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-brand-border shadow-card space-y-4">
            <h3 className="text-sm font-bold text-brand-text">Add New Payout Settlement Rail</h3>
            <form onSubmit={handleCreatePayout} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1">Method Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tron USDT, PayPal"
                  value={payoutName}
                  onChange={(e) => setPayoutName(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Symbol / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. USDT, BTC, USD"
                  value={payoutSymbol}
                  onChange={(e) => setPayoutSymbol(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Network / Bank Type</label>
                <input
                  type="text"
                  placeholder="e.g. TRC20, Wire, Polygon"
                  value={payoutNetwork}
                  onChange={(e) => setPayoutNetwork(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Fee %</label>
                <input
                  type="text"
                  placeholder="0.00%"
                  value={payoutFee}
                  onChange={(e) => setPayoutFee(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-text"
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
                >
                  Save Payout Rail
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.payoutRails?.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl glass-panel border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-brand-text">{p.name}</h4>
                    <span className="text-xs text-brand-muted">{p.network || p.type} • Fee: {p.fee} (Min: ${p.minPayout})</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePayout(p.id)}
                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FAQS CMS */}
      {/* ======================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-brand-border shadow-card space-y-4">
            <h3 className="text-sm font-bold text-brand-text">Add FAQ Item</h3>
            <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1 font-semibold">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does escrow guarantee my trade?"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1 font-semibold">Answer</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain clearly to customer..."
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold cursor-pointer"
              >
                Save FAQ
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {data.faqs?.map((f) => (
              <div key={f.id} className="p-5 rounded-2xl glass-panel border border-brand-border space-y-1.5 flex items-start justify-between">
                <div className="space-y-1 max-w-xl">
                  <h4 className="text-sm font-bold text-brand-text">{f.question}</h4>
                  <p className="text-xs text-brand-muted">{f.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(f.id)}
                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SITE SETTINGS & BRANDING CMS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="rounded-3xl glass-panel border border-brand-border p-7 shadow-card space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-brand-text">Global Platform Branding & Performance Metrics</h3>
            <p className="text-xs text-brand-muted mt-0.5">Control the public text, copy, support links, and proof stats across the entire website.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-brand-muted mb-1">Site Title</label>
              <input
                type="text"
                value={settingsForm.siteName}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Tagline</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-brand-muted mb-1">Hero Main Title</label>
              <input
                type="text"
                value={settingsForm.heroTitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-brand-muted mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settingsForm.heroSubtitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-brand-muted mb-1">Announcement Ticker Banner</label>
              <input
                type="text"
                value={settingsForm.announcementTicker}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementTicker: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Active Traders Metric</label>
              <input
                type="text"
                value={settingsForm.activeTradersCount}
                onChange={(e) => setSettingsForm({ ...settingsForm, activeTradersCount: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Volume Traded Metric</label>
              <input
                type="text"
                value={settingsForm.volumeTraded}
                onChange={(e) => setSettingsForm({ ...settingsForm, volumeTraded: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Average Payout Time Metric</label>
              <input
                type="text"
                value={settingsForm.avgPayoutTime}
                onChange={(e) => setSettingsForm({ ...settingsForm, avgPayoutTime: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-muted mb-1">Telegram Support Channel</label>
              <input
                type="text"
                value={settingsForm.telegramSupport}
                onChange={(e) => setSettingsForm({ ...settingsForm, telegramSupport: e.target.value })}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-text"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-brand-primary text-white font-extrabold text-sm shadow-md cursor-pointer"
          >
            Save All Settings
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 7: AUDIT LOG */}
      {/* ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="rounded-3xl glass-panel border border-brand-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h3 className="text-sm font-bold text-brand-text">Platform Activity & Audit History</h3>
            <button
              onClick={async () => {
                await adminFetch('/api/admin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'clear_notifications' })
                });
                fetchData();
              }}
              className="text-xs text-brand-muted hover:text-brand-text border border-brand-border px-3 py-1 rounded-lg"
            >
              Clear Log
            </button>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {data.notifications?.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-brand-surface border border-brand-border flex items-start gap-3 text-xs">
                <div className="p-1.5 rounded-lg bg-brand-bg border border-brand-border mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between font-bold text-brand-text">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-brand-muted">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-brand-muted mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RECEIPT / CARD IMAGE VIEWER MODAL */}
      {/* ======================================================== */}
      {viewingReceiptModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-brand-text truncate">{viewingReceiptModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptModal({ isOpen: false, image: '', title: '' })}
                className="p-1.5 text-brand-muted hover:text-brand-text rounded-xl hover:bg-brand-card transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 rounded-2xl bg-brand-bg border border-brand-border/60">
              {viewingReceiptModal.image?.startsWith('data:image') || viewingReceiptModal.image?.startsWith('http') ? (
                <img
                  src={viewingReceiptModal.image}
                  alt="Customer Uploaded Card / Receipt"
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center p-8 text-xs text-brand-muted space-y-2">
                  <FileText className="w-10 h-10 text-brand-muted mx-auto mb-2" />
                  <p className="font-mono">{viewingReceiptModal.image || 'No image data attached'}</p>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center text-xs">
              <span className="text-brand-muted">Operator Inspection Vault</span>
              <div className="flex gap-2">
                {viewingReceiptModal.image?.startsWith('data:image') && (
                  <a
                    href={viewingReceiptModal.image}
                    download="card-receipt.png"
                    className="px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold hover:bg-brand-primary/20 transition-colors"
                  >
                    Download Image
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingReceiptModal({ isOpen: false, image: '', title: '' })}
                  className="px-4 py-1.5 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primaryHover transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
