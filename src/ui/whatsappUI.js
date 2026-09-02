// Town Pizza Planet — WhatsApp interactive UI helpers.
const fs = require('fs');
const path = require('path');
const { Buttons, List, MessageMedia } = require('whatsapp-web.js');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PRODUCT_DIR = path.join(PUBLIC_DIR, 'product-images');
const COMBO_DIR = path.join(PUBLIC_DIR, 'combo-images');
const FAMILY_DIR = path.join(PUBLIC_DIR, 'family-packs');

function text(body) {
  return { type: 'text', body: String(body ?? '') };
}

function buttons(body, defs, title = '', footer = '') {
  return {
    type: 'buttons',
    body: String(body || ''),
    buttons: (defs || []).slice(0, 3).map(b => ({
      id: String(b.id),
      body: String(b.body),
    })),
    title: String(title || ''),
    footer: String(footer || ''),
  };
}

function list(body, buttonText, rows, title = '', footer = '') {
  return {
    type: 'list',
    body: String(body || ''),
    buttonText: String(buttonText || 'Choose'),
    sections: [{
      title: '',
      rows: (rows || []).slice(0, 10).map(r => ({
        id: String(r.id),
        title: String(r.title),
        description: String(r.description || ''),
      })),
    }],
    title: String(title || ''),
    footer: String(footer || ''),
  };
}

function image(filePath, caption = '') {
  return {
    type: 'image',
    filePath,
    caption: String(caption || ''),
  };
}

function productImage(item, caption = '') {
  if (!item?.image) return null;
  const filePath = path.join(PRODUCT_DIR, item.image);
  return fs.existsSync(filePath) ? image(filePath, caption) : null;
}

function comboImage(combo, caption = '') {
  if (!combo?.image) return null;
  const filePath = path.join(COMBO_DIR, combo.image);
  return fs.existsSync(filePath) ? image(filePath, caption) : null;
}

function familyPackImage(pack, caption = '') {
  if (!pack?.image) return null;
  const filePath = path.join(FAMILY_DIR, pack.image);
  return fs.existsSync(filePath) ? image(filePath, caption) : null;
}

function makeButtonsObject(reply) {
  return new Buttons(
    reply.body,
    reply.buttons,
    reply.title || '',
    reply.footer || ''
  );
}

function makeListObject(reply) {
  return new List(
    reply.body,
    reply.buttonText,
    reply.sections,
    reply.title || '',
    reply.footer || ''
  );
}

function makeMedia(reply) {
  if (!reply?.filePath) return null;
  return MessageMedia.fromFilePath(reply.filePath);
}

module.exports = {
  PUBLIC_DIR,
  PRODUCT_DIR,
  COMBO_DIR,
  FAMILY_DIR,
  text,
  buttons,
  list,
  image,
  productImage,
  comboImage,
  familyPackImage,
  makeButtonsObject,
  makeListObject,
  makeMedia,
};
