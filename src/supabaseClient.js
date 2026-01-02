import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ofnftvsliwcpsydrjhci.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmZ0dnNsaXdjcHN5ZHJqaGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzQ3MDksImV4cCI6MjA4MTM1MDcwOX0.P6y5-_77uMMxzL8rw0-i9d2gGd27eY71tRZ8VoM9Dz4'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'sekolah-pekanbaru-auth',
    storage: localStorage
  }
})

// ==================== AUTH FUNCTIONS ====================
export const loginUser = async (email, password) => {
  try {
    // Hash password dengan SHA-256
    const hashedPassword = await hashPassword(password)
    
    // Cek user di tabel users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      throw new Error('Email atau password salah')
    }
    
    // Verifikasi password
    const isPasswordValid = await verifyPassword(password, user.password_hash)
    
    if (!isPasswordValid) {
      throw new Error('Email atau password salah')
    }
    
    // Simpan session
    const session = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap
      },
      expires_at: Date.now() + (24 * 60 * 60 * 1000)
    }
    
    localStorage.setItem('supabase.auth.token', JSON.stringify(session))
    localStorage.setItem('user', JSON.stringify(user))
    
    return { success: true, user }
  } catch (error) {
    console.error('Login error:', error.message)
    return { success: false, error: error.message }
  }
}

export const hashPassword = async (password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const verifyPassword = async (password, storedHash) => {
  const hashedInput = await hashPassword(password)
  return hashedInput === storedHash
}

export const logoutUser = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('supabase.auth.token')
  window.location.href = '/login'
}

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    const user = JSON.parse(userStr)
    const authStr = localStorage.getItem('supabase.auth.token')
    
    if (authStr) {
      const auth = JSON.parse(authStr)
      if (auth.expires_at && auth.expires_at < Date.now()) {
        logoutUser()
        return null
      }
    }
    
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const isAuthenticated = () => {
  return getCurrentUser() !== null
}

export const isAdmin = () => {
  const user = getCurrentUser()
  return user && user.role === 'admin'
}

// ==================== SEKOLAH CRUD FUNCTIONS ====================
export const sekolahService = {
  // Get all sekolah dengan pagination
  getAll: async (page = 1, limit = 10, search = '') => {
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    let query = supabase
      .from('sekolah')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (search) {
      query = query.or(`nama_sekolah.ilike.%${search}%,npsn.ilike.%${search}%,alamat.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query.range(from, to)
    
    if (error) throw error
    
    return {
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  },
  
  // Get sekolah by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('sekolah')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Create new sekolah
  create: async (sekolahData) => {
    // Validasi required fields
    const requiredFields = ['nama_sekolah', 'npsn', 'jenjang_pendidikan', 'status_sekolah']
    for (const field of requiredFields) {
      if (!sekolahData[field]) {
        throw new Error(`${field} harus diisi`)
      }
    }
    
    // Format data
    const dataToInsert = {
      ...sekolahData,
      npsn: sekolahData.npsn.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('sekolah')
      .insert([dataToInsert])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  // Update sekolah
  update: async (id, sekolahData) => {
    const dataToUpdate = {
      ...sekolahData,
      npsn: sekolahData.npsn ? sekolahData.npsn.toString() : undefined,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('sekolah')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  // Delete sekolah
  delete: async (id) => {
    const { error } = await supabase
      .from('sekolah')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },
  
  // Import multiple sekolah
  import: async (sekolahList) => {
    const dataToInsert = sekolahList.map(sekolah => ({
      ...sekolah,
      npsn: sekolah.npsn.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    const { data, error } = await supabase
      .from('sekolah')
      .insert(dataToInsert)
      .select()
    
    if (error) throw error
    return data
  },
  
  // Get statistics
  getStats: async () => {
    const { count: total, error: totalError } = await supabase
      .from('sekolah')
      .select('*', { count: 'exact', head: true })
    
    if (totalError) throw totalError
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayCount, error: todayError } = await supabase
      .from('sekolah')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    if (todayError) throw todayError
    
    const { count: akreditasiA, error: akreditasiError } = await supabase
      .from('sekolah')
      .select('*', { count: 'exact', head: true })
      .eq('akreditasi', 'A')
    
    if (akreditasiError) throw akreditasiError
    
    // Group by jenjang pendidikan
    const { data: jenjangData, error: jenjangError } = await supabase
      .from('sekolah')
      .select('jenjang_pendidikan')
    
    if (jenjangError) throw jenjangError
    
    const jenjangStats = jenjangData.reduce((acc, curr) => {
      const jenjang = curr.jenjang_pendidikan || 'Lainnya'
      acc[jenjang] = (acc[jenjang] || 0) + 1
      return acc
    }, {})
    
    return {
      total: total || 0,
      today: todayCount || 0,
      akreditasiA: akreditasiA || 0,
      jenjangStats
    }
  },
  
  // Get recent sekolah
  getRecent: async (limit = 5) => {
    const { data, error } = await supabase
      .from('sekolah')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }
}

// ==================== USERS FUNCTIONS ====================
export const userService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  create: async (userData) => {
    const hashedPassword = await hashPassword(userData.password)
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id, userData) => {
    const dataToUpdate = {
      ...userData,
      updated_at: new Date().toISOString()
    }
    
    if (userData.password) {
      dataToUpdate.password_hash = await hashPassword(userData.password)
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
  
}
// Tambahkan fungsi-fungsi ini di supabaseClient.js Anda

// Fungsi untuk upload gambar
export const uploadImage = async (file, folder = 'sekolah') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('gambar')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gambar')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl, path: filePath };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk menghapus gambar
export const deleteImage = async (filePath) => {
  try {
    // Extract path from full URL if needed
    const path = filePath.includes('storage/v1/object/public/gambar/') 
      ? filePath.split('storage/v1/object/public/gambar/')[1]
      : filePath;

    const { error } = await supabase.storage
      .from('gambar')
      .remove([path]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan semua gambar
export const listImages = async (folder = 'sekolah') => {
  try {
    const { data, error } = await supabase.storage
      .from('gambar')
      .list(folder);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error listing images:', error);
    return { success: false, error: error.message };
  }
};