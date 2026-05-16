// 1. Konfigurasi Supabase
const supabaseUrl = 'https://vkbqqplwasswouduvtfk.supabase.co';
const supabaseKey = 'sb_publishable_MN5FrcqNFqMhpCTuLKuCyA_2erVjNVT';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const authForm = document.getElementById('auth-form');
const toggleModeBtn = document.getElementById('toggle-mode');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const messageDiv = document.getElementById('message');

let isLoginMode = true;

// Toggle antara mode Login dan Register
toggleModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    formTitle.textContent = isLoginMode ? 'Login Portal' : 'Buat Akun Baru';
    submitBtn.textContent = isLoginMode ? 'Login' : 'Daftar';
    toggleModeBtn.innerHTML = isLoginMode ? 'Buat Akun di sini' : 'Sudah punya akun? Login';
    messageDiv.textContent = '';
});

// Handle Submit Form (Login / Register)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';
    messageDiv.textContent = '';
    messageDiv.style.color = 'black';

    try {
        if (!isLoginMode) {
            // PROSES REGISTER
            // Menyimpan role ke dalam metadata user di Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { role: role }
                }
            });

            if (error) throw error;
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Akun berhasil dibuat! Silakan login.';

            // Simpan juga ke tabel 'profiles' jika ingin mudah di-CRUD nanti
            if (data.user) {
                await tambahDataProfil(data.user.id, email, role);
            }

        } else {
            // PROSES LOGIN
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            // Cek role user dari metadata untuk routing
            const userRole = data.user.user_metadata.role || role;

            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Login berhasil! Mengalihkan...';

            // Redirect berdasarkan role
            setTimeout(() => {
                if (userRole === 'guru') {
                    window.location.href = 'halaman_guru.html';
                } else {
                    window.location.href = 'halaman_siswa.html';
                }
            }, 1000);
        }
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Login' : 'Daftar';
    }
});

/* ==========================================
   FUNGSI CRUD (TAMBAH, BACA, HAPUS DATA)
   ========================================== */

// Fungsi Tambah Data (Insert) ke tabel 'profiles'
async function tambahDataProfil(userId, email, role) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([
            { id: userId, email: email, role: role, created_at: new Date() }
        ]);

    if (error) console.error('Gagal menambah profil:', error);
    return data;
}

// Fungsi Baca Data (Select)
// Bisa dipanggil di halaman_guru.html atau halaman_siswa.html
async function ambilData() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) console.error('Gagal mengambil data:', error);
    console.log('Data profil:', data);
    return data;
}

// Fungsi Hapus Data (Delete)
async function hapusData(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Gagal menghapus:', error);
    } else {
        console.log('Data berhasil dihapus');
    }
    return data;
}