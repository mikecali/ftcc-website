# FTCC — Filipino Tech Community Canberra
### Website · Deployment Guide

---

## 📁 Project structure

```
ftcc/
├── index.html          # Home page
├── about.html          # About page
├── programs.html       # Programs & services
├── events.html         # Events listing
├── membership.html     # Membership info & process
├── contact.html        # Contact form
├── css/
│   └── style.css       # All styles
└── js/
    ├── components.js   # Shared nav & footer (injected into every page)
    └── main.js         # Scroll animations, mobile menu, form handling
```

This is a **fully static website** — no backend, no build step, no Node.js required. Just HTML, CSS and vanilla JS.

---

## 🚀 Deploying to a Google Cloud VM (with HTTPS via self-signed cert)

### Prerequisites
- A Google Cloud VM running Ubuntu 20.04 / 22.04 / 24.04
- SSH access to the instance
- Port 80 and 443 open in your GCP firewall rules

---

### Step 1 — Open firewall ports in GCP

In the Google Cloud Console:

1. Go to **VPC Network → Firewall**
2. Create a rule for **HTTP**:
   - Name: `allow-http`
   - Direction: Ingress
   - Action: Allow
   - Ports: `tcp:80`
   - Source: `0.0.0.0/0`
3. Create a rule for **HTTPS**:
   - Name: `allow-https`
   - Direction: Ingress
   - Action: Allow
   - Ports: `tcp:443`
   - Source: `0.0.0.0/0`

---

### Step 2 — SSH into your instance

```bash
gcloud compute ssh YOUR_INSTANCE_NAME --zone=YOUR_ZONE
```

Or use the **SSH button** in the Cloud Console.

---

### Step 3 — Install Apache

```bash
sudo apt update
sudo apt install apache2 unzip -y
sudo systemctl enable apache2
sudo systemctl start apache2
```

---

### Step 4 — Upload the site files

**Option A — Clone from GitHub (recommended)**

```bash
cd /tmp
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
sudo cp -r YOUR_REPO_NAME/* /var/www/html/
```

**Option B — Upload zip via gcloud (from your local machine)**

```bash
# Run this on your LOCAL machine, not the SSH session
gcloud compute scp ftcc-website.zip YOUR_INSTANCE_NAME:~ --zone=YOUR_ZONE
```

Then back in the SSH session:
```bash
unzip ~/ftcc-website.zip
sudo cp -r ftcc/* /var/www/html/
```

---

### Step 5 — Fix file permissions

```bash
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo rm /var/www/html/index.html.bak 2>/dev/null || true  # remove Apache default if it was backed up
```

---

### Step 6 — Set up HTTPS with a self-signed certificate

> ⚠️ A self-signed certificate encrypts traffic but browsers will show a "not trusted" warning.
> This is fine for internal/dev use. For production, see the [Custom Domain + Cloudflare](#-upgrading-to-a-trusted-certificate-with-a-domain) section below.

**Generate the certificate:**

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/ftcc-selfsigned.key \
  -out /etc/ssl/certs/ftcc-selfsigned.crt
```

When prompted, fill in the fields. For **Common Name**, enter your **VM's external IP address**.

**Enable SSL in Apache:**

```bash
sudo a2enmod ssl
sudo a2enmod rewrite
```

**Edit the SSL config:**

```bash
sudo nano /etc/apache2/sites-available/default-ssl.conf
```

Find and update these two lines:

```apache
SSLCertificateFile    /etc/ssl/certs/ftcc-selfsigned.crt
SSLCertificateKeyFile /etc/ssl/private/ftcc-selfsigned.key
```

**Enable the SSL site and restart Apache:**

```bash
sudo a2ensite default-ssl
sudo systemctl restart apache2
```

---

### Step 7 — Redirect HTTP → HTTPS (optional but recommended)

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Replace the contents with:

```apache
<VirtualHost *:80>
    ServerName YOUR_EXTERNAL_IP
    Redirect permanent / https://YOUR_EXTERNAL_IP/
</VirtualHost>
```

Then restart:

```bash
sudo systemctl restart apache2
```

---

### Step 8 — Visit your site

Open your browser and go to:

```
https://YOUR_EXTERNAL_IP
```

Your browser will show a security warning — click **Advanced → Proceed** to continue. The site will load over HTTPS.

---

## 🌐 Upgrading to a trusted certificate (with a domain)

When you're ready to add a proper domain and get a green padlock:

### Option A — Cloudflare (easiest, free SSL)

1. Buy a domain (Cloudflare Registrar, Namecheap, Crazy Domains, etc.)
2. Add the domain to [Cloudflare](https://cloudflare.com) (free plan)
3. In Cloudflare DNS, add an **A record** pointing to your GCP external IP
4. Set SSL/TLS mode to **Full** in Cloudflare dashboard
5. Done — no changes needed on the server

### Option B — Let's Encrypt via Certbot (free, cert on server)

```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

Certbot handles everything and auto-renews every 90 days. Verify renewal works:

```bash
sudo certbot renew --dry-run
```

---

## 🔄 Updating the site after changes

If you cloned from GitHub, updating is one command on the server:

```bash
cd /tmp/YOUR_REPO_NAME
git pull
sudo cp -r * /var/www/html/
sudo systemctl reload apache2
```

---

## 🛠️ Useful commands

| Task | Command |
|---|---|
| Check Apache status | `sudo systemctl status apache2` |
| Restart Apache | `sudo systemctl restart apache2` |
| View Apache error logs | `sudo tail -f /var/log/apache2/error.log` |
| View access logs | `sudo tail -f /var/log/apache2/access.log` |
| Test Apache config | `sudo apache2ctl configtest` |
| Reserve static IP | GCP Console → VPC Network → IP addresses → Promote to Static |

---

## 📝 Making content edits

All content lives directly in the HTML files — no CMS or build process.

- **Nav & Footer** — edit `js/components.js` (shared across all pages)
- **Styles** — edit `css/style.css`
- **Page content** — edit the relevant `.html` file directly
- **New pages** — copy an existing page, update the content, and add a link in `js/components.js`

---

## 📬 Contact form

The contact form in `contact.html` is wired to **[Web3Forms](https://web3forms.com)** (free, no backend). To turn on email delivery:

1. Go to [web3forms.com](https://web3forms.com) and enter **hello@ftcc.org.au** to generate an access key (no account or password needed — the key is emailed to you).
2. In `contact.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.

That's it — submissions then arrive at hello@ftcc.org.au. The access key is a public client-side key and is safe to commit: it only ever delivers to that inbox. A hidden honeypot field silently drops bots.

**Until the key is set**, the form still works: submitting opens the visitor's email app pre-filled to hello@ftcc.org.au, so it is never a dead end.

---

## 🏛️ About FTCC

Filipino Tech Community Canberra (FTCC) is a duly-incorporated association in the Australian Capital Territory.

**Email:** hello@ftcc.org.au  
**Facebook:** [facebook.com/filotechcanberra](https://www.facebook.com/filotechcanberra/)  
**Website:** [ftcc.org.au](https://ftcc.org.au)

*The FTCC acknowledges the Ngunnawal people as traditional custodians of the ACT and recognise any other people or families with connection to the lands of the ACT and region.*
