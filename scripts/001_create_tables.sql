-- Tabla de canciones
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  album_image_url TEXT NOT NULL,
  preview_url TEXT,
  external_url TEXT NOT NULL,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de frases
CREATE TABLE IF NOT EXISTS phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  time_type TEXT NOT NULL CHECK (time_type IN ('morning', 'afternoon', 'evening', 'night', 'anytime')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de fotos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  description TEXT,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_songs_order ON songs(order_position);
CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(order_position);
CREATE INDEX IF NOT EXISTS idx_phrases_time ON phrases(time_type);

-- Insertar frases de ejemplo
INSERT INTO phrases (text, time_type) VALUES
  ('Buenos días Epitelia, que tengas un día hermoso', 'morning'),
  ('Hola Epitelia, espero que tu día vaya increíble', 'afternoon'),
  ('Buenas tardes Epitelia, ya casi termina el día', 'evening'),
  ('Buenas noches Epitelia, dulces sueños', 'night'),
  ('Te quiero mucho Epitelia', 'anytime'),
  ('Eres lo mejor que me ha pasado', 'anytime'),
  ('Cada día contigo es una aventura', 'anytime');
