import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Order, PaymentMethod, ShippingAddress } from '../types';
import { ShieldCheck, Truck, Banknote, ArrowLeft, ArrowRight, Check, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';
import { PerfumeBottleGraphic } from '../components/ui/PerfumeBottleGraphic';
import { formatOrderEmail, DEFAULT_ORDER_NOTIFICATION_EMAIL } from '../lib/orderEmailService';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    couponDiscount,
    shippingRates,
    calculateShippingFee,
    createOrder,
    currentUser,
    settings,
  } = useStore();

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.addresses?.[0]?.address || '',
    city: currentUser?.addresses?.[0]?.city || 'Casablanca',
    region: currentUser?.addresses?.[0]?.region || 'Casablanca-Settat',
    postalCode: currentUser?.addresses?.[0]?.postalCode || '20000',
    notes: '',
  });

  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (confirmedOrder) {
    const targetEmail = settings.orderNotificationEmail || DEFAULT_ORDER_NOTIFICATION_EMAIL;
    const emailPayload = formatOrderEmail(confirmedOrder, targetEmail);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#121216] border border-[#2B2B38] p-8 sm:p-10 rounded-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
              COMMANDE CONFIRMÉE AVEC SUCCÈS
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#F5F1EB]">
              Merci pour votre commande, {confirmedOrder.customer.firstName} !
            </h1>
            <p className="text-xs text-[#A7A3A0]">
              Référence officielle : <strong className="font-mono text-[#D8B08C]">#{confirmedOrder.orderNumber}</strong>
            </p>
          </div>

          {/* Email Notification Dispatch Status Banner */}
          <div className="p-4 bg-[#181822] border border-[#D8B08C]/30 rounded-sm text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D8B08C]">
              <Mail className="w-4 h-4 text-[#D8B08C]" />
              <span>Notification transmise à l'atelier : {targetEmail}</span>
            </div>
            <p className="text-[11px] text-[#A7A3A0] leading-relaxed">
              L'ensemble des coordonnées de livraison, articles commandés et montants ont été envoyés à l'adresse 
              <strong className="text-[#F5F1EB] font-mono"> {targetEmail}</strong> pour validation et mise en préparation immédiate.
            </p>
          </div>

          {/* Order Details Brief */}
          <div className="bg-[#16161D] border border-[#22222A] p-4 rounded-sm text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-[#22222A] pb-2 text-[#A7A3A0]">
              <span>Destinataire :</span>
              <span className="text-[#F5F1EB] font-medium">{confirmedOrder.customer.firstName} {confirmedOrder.customer.lastName} ({confirmedOrder.customer.phone})</span>
            </div>
            <div className="flex justify-between border-b border-[#22222A] pb-2 text-[#A7A3A0]">
              <span>Ville de livraison :</span>
              <span className="text-[#F5F1EB] font-medium">{confirmedOrder.customer.city} · {confirmedOrder.customer.address}</span>
            </div>
            <div className="flex justify-between border-b border-[#22222A] pb-2 text-[#A7A3A0]">
              <span>Mode de règlement :</span>
              <span className="text-[#F5F1EB] font-medium">
                Paiement à la livraison (Espèces au livreur)
              </span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-[#D8B08C]">
              <span>Total à régler :</span>
              <span className="font-mono">{confirmedOrder.total} {settings.currency}</span>
            </div>
          </div>

          {/* Interactive Fast Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={emailPayload.gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1C1C26] hover:bg-[#252533] border border-[#333344] text-[#F5F1EB] text-xs font-semibold rounded-sm transition-colors"
            >
              <Mail className="w-4 h-4 text-red-400" />
              <span>Ouvrir dans Gmail ({targetEmail})</span>
            </a>

            <a
              href={emailPayload.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-semibold rounded-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Confirmer sur WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#22222A]">
            <button
              onClick={() => navigate(`/account/orders?success=${confirmedOrder.orderNumber}`)}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-bold text-xs uppercase tracking-widest rounded-sm"
            >
              Voir le suivi de ma commande
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="py-2.5 px-6 bg-[#16161C] border border-[#2B2B38] text-[#A7A3A0] hover:text-[#F5F1EB] text-xs rounded-sm transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-serif text-[#F5F1EB]">Votre panier est vide</h2>
        <p className="text-xs text-[#A7A3A0] mt-2 mb-6">
          Ajoutez des fragrances à votre panier avant de procéder au règlement.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-semibold text-xs uppercase tracking-widest rounded-sm"
        >
          Découvrir la boutique
        </button>
      </div>
    );
  }

  const shippingFee = calculateShippingFee(formData.city, shippingMethod, cartSubtotal);
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - couponDiscount);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const result = createOrder({
        customer: formData,
        shippingMethod,
        paymentMethod,
      });

      setIsProcessing(false);

      if (result.success && result.order) {
        setConfirmedOrder(result.order);
      } else if (result.success && result.orderId) {
        navigate(`/account/orders?success=${result.orderNumber}`);
      } else {
        setErrorMsg(result.message || 'Une erreur est survenue lors de la commande.');
      }
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#22222A]">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-xs text-[#A7A3A0] hover:text-[#F5F1EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continuer mes achats</span>
        </button>
        <span className="text-xs font-mono uppercase tracking-widest text-[#D8B08C]">
          COMMANDE SÉCURISÉE
        </span>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form: Customer Info, Shipping Address, Delivery & Payment */}
        <div className="lg:col-span-7 space-y-10">
          {/* Étape 1 : Informations Client */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h2 className="text-lg font-serif text-[#F5F1EB]">Informations Personnelles</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Téléphone (pour la livraison) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="06 XX XX XX XX ou +212 6 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Email (pour confirmation &amp; suivi) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
            </div>
          </div>

          {/* Étape 2 : Adresse de Livraison */}
          <div className="space-y-4 pt-6 border-t border-[#1C1C24]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h2 className="text-lg font-serif text-[#F5F1EB]">Adresse de Livraison au Maroc</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Adresse (Rue, Numéro, Résidence, Appartement) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : 14 Rue de la Liberté, Apt 3B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Ville *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                >
                  {shippingRates.map((r) => (
                    <option key={r.id} value={r.city}>
                      {r.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Code Postal
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] block mb-1">
                  Instructions de livraison (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Appeler à l’arrivée, code interphone 2410"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#121216] border border-[#2B2B38] px-3.5 py-2 text-xs text-[#F5F1EB] rounded-sm focus:outline-none focus:border-[#D8B08C]"
                />
              </div>
            </div>
          </div>

          {/* Étape 3 : Mode de Livraison */}
          <div className="space-y-4 pt-6 border-t border-[#1C1C24]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h2 className="text-lg font-serif text-[#F5F1EB]">Mode de Livraison</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setShippingMethod('STANDARD')}
                className={`p-4 border rounded-sm cursor-pointer flex flex-col justify-between transition-all ${
                  shippingMethod === 'STANDARD'
                    ? 'border-[#D8B08C] bg-[#171720]'
                    : 'border-[#242430] bg-[#121216] hover:border-[#333342]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D8B08C]" />
                    <span className="text-xs font-semibold text-[#F5F1EB]">
                      Livraison Standard
                    </span>
                  </div>
                  {shippingMethod === 'STANDARD' && (
                    <Check className="w-4 h-4 text-[#D8B08C]" />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-[#A7A3A0]">Délai estimé : 24h à 48h</span>
                  <span className="font-mono text-[#D8B08C] font-semibold">
                    {cartSubtotal >= settings.freeShippingThreshold ? 'Offerte' : `${shippingFee} DH`}
                  </span>
                </div>
              </label>

              <label
                onClick={() => setShippingMethod('EXPRESS')}
                className={`p-4 border rounded-sm cursor-pointer flex flex-col justify-between transition-all ${
                  shippingMethod === 'EXPRESS'
                    ? 'border-[#D8B08C] bg-[#171720]'
                    : 'border-[#242430] bg-[#121216] hover:border-[#333342]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C98F78]" />
                    <span className="text-xs font-semibold text-[#F5F1EB]">
                      Livraison Express VIP
                    </span>
                  </div>
                  {shippingMethod === 'EXPRESS' && (
                    <Check className="w-4 h-4 text-[#C98F78]" />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-[#A7A3A0]">Prioritaire le lendemain</span>
                  <span className="font-mono text-[#C98F78] font-semibold">
                    {cartSubtotal >= settings.freeShippingThreshold ? '25 DH' : '55 DH'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Étape 4 : Mode de Paiement */}
          <div className="space-y-4 pt-6 border-t border-[#1C1C24]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#181820] border border-[#D8B08C] text-[#D8B08C] font-mono text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <h2 className="text-lg font-serif text-[#F5F1EB]">Mode de Paiement</h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-sm">
                Paiement à la livraison
              </span>
            </div>

            <div className="p-4 border border-[#D8B08C]/60 bg-[#171720] rounded-sm flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-sm bg-[#22222E] flex items-center justify-center text-[#D8B08C] shrink-0 border border-[#3A3A4C]">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5F1EB] block">
                      Paiement en espèces à la livraison (Cash on Delivery)
                    </span>
                    <span className="text-[9px] font-mono text-[#D8B08C] bg-[#241F1A] border border-[#D8B08C]/40 px-1.5 py-0.5 rounded">
                      Mode unique disponible
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A7A3A0] block mt-1">
                    Réglez en espèces directement auprès du livreur à la réception de votre flacon partout au Maroc. Aucun prépaiement en ligne par carte n'est requis.
                  </span>
                </div>
              </div>
              <Check className="w-5 h-5 text-[#D8B08C] shrink-0 ml-3" />
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-[#121216] border border-[#262632] p-6 rounded-sm shadow-2xl space-y-6">
            <h3 className="text-sm font-sans uppercase tracking-[0.2em] font-semibold text-[#F5F1EB] pb-3 border-b border-[#22222A]">
              Récapitulatif de Commande
            </h3>

            {/* Articles list */}
            <div className="divide-y divide-[#1D1D24] max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.volume}`}
                  className="py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-12 bg-[#0A0A0D] border border-[#252530] rounded-sm flex items-center justify-center p-1 shrink-0">
                    <PerfumeBottleGraphic
                      name={item.product.name}
                      category={item.product.gender}
                      volume={item.volume}
                      accentColor={item.product.accentColor}
                      size="sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-serif font-medium text-[#F5F1EB] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-[#A7A3A0]">
                      {item.volume} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#D8B08C] tabular-nums">
                    {item.price * item.quantity} {settings.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-[#1F1F27] text-xs text-[#A7A3A0]">
              <div className="flex justify-between">
                <span>Sous-total articles</span>
                <span className="font-mono text-[#F5F1EB] tabular-nums">
                  {cartSubtotal} {settings.currency}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Code avantage ({appliedCoupon.code})</span>
                  <span className="font-mono tabular-nums">
                    -{couponDiscount} {settings.currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frais de livraison ({formData.city})</span>
                <span className="font-mono text-[#D8B08C] tabular-nums">
                  {shippingFee === 0 ? 'Offerte' : `${shippingFee} ${settings.currency}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold text-[#F5F1EB] pt-3 border-t border-[#262632]">
                <span>Total à régler</span>
                <span className="font-mono text-[#D8B08C] text-lg tabular-nums">
                  {totalAmount} {settings.currency}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-sm text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-[#D8B08C] via-[#C9A46C] to-[#C98F78] hover:brightness-110 text-[#0B0B0D] font-bold text-xs uppercase tracking-[0.25em] rounded-sm transition-all shadow-xl shadow-[#D8B08C]/15 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <span>CONFIRMER LA COMMANDE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#A7A3A0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B08C]" />
              <span>Garantie authenticité &amp; confidentialité de vos données</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
