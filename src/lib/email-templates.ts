// Matches the website palette (src/styles.css). Indigo brand + red accent.
const BRAND = {
  primary: "#2f378d",
  primaryDark: "#272d74",
  secondary: "#202560",
  accent: "#B8001F",
  mint: "#dddfec",
  sky: "#8e93c3",
  ink: "#30313d",
  inkSoft: "#757783",
  paper: "#ffffff",
  cream: "#f3f3f8",
  border: "#e4e4ee",
};

// Public URL of the logo (served from /public). Absolute URL is required so it
// renders inside email clients.
const SITE_URL = "https://droguerie-souss.vercel.app";
const LOGO_URL = `${SITE_URL}/logo.png`;

// Font stacks that echo the site: Fraunces (serif display) falls back to
// Georgia in email clients; Inter (body) falls back to Arial/Helvetica.
const DISPLAY_FONT = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY_FONT = "'Inter', Helvetica, Arial, sans-serif";

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>Droguerie Souss</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:${BODY_FONT};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Top strip (echoes the website header banner) -->
          <tr>
            <td style="background:${BRAND.secondary};padding:10px 32px;border-radius:16px 16px 0 0;text-align:center;">
              <span style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#c9cce6;">
                Livraison rapide dans tout le Souss &nbsp;&middot;&nbsp; Devis gratuit sous 24h
              </span>
            </td>
          </tr>
          <!-- Logo header -->
          <tr>
            <td style="background:${BRAND.paper};padding:28px 32px 20px;text-align:center;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
              <img src="${LOGO_URL}" alt="Droguerie Souss" width="190" style="display:inline-block;width:190px;max-width:70%;height:auto;" />
            </td>
          </tr>
          <!-- Accent divider -->
          <tr>
            <td style="background:${BRAND.paper};padding:0 32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
              <div style="height:3px;background:${BRAND.primary};border-radius:3px;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:${BRAND.paper};padding:28px 32px 32px;border-radius:0 0 16px 16px;border:1px solid ${BRAND.border};border-top:none;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 0;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.inkSoft};">
                <strong style="color:${BRAND.ink};">Droguerie Souss S.A.R.L</strong><br />
                Zone Industrielle, Agadir 80000, Maroc
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${BRAND.inkSoft};">
                <a href="tel:+212528000000" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">+212 528 000 000</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:contact@drogueriesouss.ma" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">contact@drogueriesouss.ma</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-family:${DISPLAY_FONT};font-size:24px;font-weight:600;color:${BRAND.ink};letter-spacing:-0.01em;">${text}</h2>`;
}

function labelValue(label: string, value: string): string {
  return `<tr><td style="padding:4px 0;font-size:13px;color:${BRAND.inkSoft};width:120px;vertical-align:top;">${label}</td><td style="padding:4px 0;font-size:13px;color:${BRAND.ink};font-weight:600;">${value}</td></tr>`;
}

export function orderConfirmationEmail(order: {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_city: string;
  customer_address: string;
  payment_method: string;
  total: number;
  items: { product_name: string; qty: number; price: number }[];
}): string {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};">${i.product_name}</td><td style="padding:6px 0;font-size:13px;color:${BRAND.inkSoft};text-align:center;">${i.qty}</td><td style="padding:6px 0;font-size:13px;color:${BRAND.ink};text-align:right;font-weight:600;">${i.price.toFixed(2)} MAD</td></tr>`,
    )
    .join("");

  return baseHtml(`
    ${heading("Nouvelle commande")}
    <p style="margin:0 0 20px;font-size:13px;color:${BRAND.inkSoft};">Une nouvelle commande a été passée sur Droguerie Souss.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${labelValue("Commande", `#${order.id.slice(0, 8)}`)}
      ${labelValue("Client", order.customer_name)}
      ${labelValue("Téléphone", order.customer_phone)}
      ${order.customer_email ? labelValue("Email", order.customer_email) : ""}
      ${labelValue("Ville", order.customer_city)}
      ${labelValue("Adresse", order.customer_address)}
      ${labelValue("Paiement", order.payment_method === "cod" ? "Livraison" : order.payment_method === "bank" ? "Virement" : "Représentant")}
    </table>

    <hr style="border:none;border-top:1px solid ${BRAND.cream};margin:20px 0;" />

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <th style="padding:8px 0;font-size:12px;color:${BRAND.inkSoft};text-transform:uppercase;text-align:left;border-bottom:2px solid ${BRAND.cream};">Article</th>
        <th style="padding:8px 0;font-size:12px;color:${BRAND.inkSoft};text-transform:uppercase;text-align:center;border-bottom:2px solid ${BRAND.cream};">Qté</th>
        <th style="padding:8px 0;font-size:12px;color:${BRAND.inkSoft};text-transform:uppercase;text-align:right;border-bottom:2px solid ${BRAND.cream};">Prix</th>
      </tr>
      ${itemsHtml}
    </table>

    <hr style="border:none;border-top:2px solid ${BRAND.primary};margin:16px 0;" />

    <p style="margin:0;font-size:16px;font-weight:700;text-align:right;color:${BRAND.ink};">
      Total : ${order.total.toFixed(2)} MAD
    </p>
  `);
}

export function contactCustomerConfirmation(contact: { name: string }): string {
  return baseHtml(`
    ${heading("Merci de nous avoir contactés")}
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.ink};line-height:1.6;">
      Bonjour <strong>${contact.name}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:${BRAND.inkSoft};line-height:1.6;">
      Nous avons bien reçu votre message. Notre équipe vous recontactera
      dans les plus brefs délais (sous 24h ouvrées).
    </p>
    <hr style="border:none;border-top:1px solid ${BRAND.cream};margin:20px 0;" />
    <p style="margin:0;font-size:12px;color:${BRAND.inkSoft};text-align:center;">
      Droguerie Souss S.A.R.L Zone Industrielle, Agadir 80000, Maroc
    </p>
  `);
}

export function orderCustomerConfirmation(order: { customer_name: string; total: number }): string {
  return baseHtml(`
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.accent};">
      Demande bien reçue
    </p>
    ${heading("Merci pour votre commande")}

    <p style="margin:0 0 16px;font-size:15px;color:${BRAND.ink};line-height:1.6;">
      Bonjour <strong>${order.customer_name}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.inkSoft};line-height:1.7;">
      Nous avons bien reçu votre demande de devis. Notre équipe la prépare et
      vous contactera <strong style="color:${BRAND.ink};">sous 24&nbsp;heures</strong>
      pour confirmer les disponibilités, le prix final et organiser la livraison.
    </p>

    <!-- Total card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:12px;padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.inkSoft};">
                Montant estimé
              </td>
              <td style="text-align:right;font-family:${DISPLAY_FONT};font-size:26px;font-weight:600;color:${BRAND.primary};">
                ${order.total.toFixed(2)} MAD
              </td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:12px;color:${BRAND.inkSoft};line-height:1.5;">
            Montant indicatif. Aucun paiement en ligne le devis final sera
            confirmé par notre équipe.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="border-radius:9999px;background:${BRAND.primary};">
          <a href="${SITE_URL}/produits" style="display:inline-block;padding:13px 30px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.paper};text-decoration:none;">
            Continuer vos achats
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:${BRAND.inkSoft};line-height:1.6;">
      Une question ? Répondez simplement à cet email ou appelez-nous au
      <a href="tel:+212528000000" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">+212&nbsp;528&nbsp;000&nbsp;000</a>.
    </p>
  `);
}

export function contactNotificationEmail(contact: {
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  message: string;
}): string {
  return baseHtml(`
    ${heading("Nouveau message de contact")}
    <p style="margin:0 0 20px;font-size:13px;color:${BRAND.inkSoft};">Un client a envoyé un message depuis le formulaire de contact.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${labelValue("Nom", contact.name)}
      ${labelValue("Téléphone", contact.phone)}
      ${contact.email ? labelValue("Email", contact.email) : ""}
      ${contact.city ? labelValue("Ville", contact.city) : ""}
    </table>

    <hr style="border:none;border-top:1px solid ${BRAND.cream};margin:20px 0;" />

    <h3 style="margin:0 0 8px;font-size:13px;color:${BRAND.inkSoft};text-transform:uppercase;">Message</h3>
    <p style="margin:0;font-size:14px;color:${BRAND.ink};line-height:1.6;white-space:pre-wrap;">${contact.message}</p>
  `);
}
