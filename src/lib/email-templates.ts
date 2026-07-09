const BRAND = {
  primary: "#4274d9",
  primaryDark: "#2c5bb8",
  accent: "#b8001f",
  mint: "#d0e7e6",
  sky: "#95ccdd",
  ink: "#393737",
  inkSoft: "#6b6968",
  paper: "#ffffff",
  cream: "#f6f7f9",
};

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Droguerie Souss</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:Inter,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:${BRAND.primary};padding:24px 32px;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-family:'Barlow Condensed',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${BRAND.paper};">
                Droguerie Souss
              </h1>
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.paper};padding:32px;border-radius:0 0 12px 12px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.inkSoft};">
                Droguerie Souss S.A.R.L &mdash; Zone Industrielle, Agadir 80000, Maroc
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:${BRAND.inkSoft};">
                <a href="tel:+212528000000" style="color:${BRAND.primary};text-decoration:none;">+212 528 000 000</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:contact@drogueriesouss.ma" style="color:${BRAND.primary};text-decoration:none;">contact@drogueriesouss.ma</a>
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
  return `<h2 style="margin:0 0 16px;font-family:'Barlow Condensed',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;color:${BRAND.ink};">${text}</h2>`;
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

export function contactCustomerConfirmation(contact: {
  name: string;
}): string {
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
      Droguerie Souss S.A.R.L &mdash; Zone Industrielle, Agadir 80000, Maroc
    </p>
  `);
}

export function orderCustomerConfirmation(order: {
  customer_name: string;
  total: number;
}): string {
  return baseHtml(`
    ${heading("Confirmation de votre demande")}
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.ink};line-height:1.6;">
      Bonjour <strong>${order.customer_name}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:${BRAND.inkSoft};line-height:1.6;">
      Nous avons bien reçu votre demande de devis d&rsquo;un montant de
      <strong>${order.total.toFixed(2)} MAD</strong>.
      Notre équipe vous contactera sous 24h pour confirmer les disponibilités
      et organiser la livraison.
    </p>
    <hr style="border:none;border-top:1px solid ${BRAND.cream};margin:20px 0;" />
    <p style="margin:0;font-size:12px;color:${BRAND.inkSoft};text-align:center;">
      Droguerie Souss S.A.R.L &mdash; Zone Industrielle, Agadir 80000, Maroc
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
