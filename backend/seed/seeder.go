package seed

import (
	"log"

	"koshub/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedDB(db *gorm.DB) {
	log.Println("Seeding database...")

	// 1. Seed Users
	var countUsers int64
	db.Model(&models.User{}).Count(&countUsers)
	if countUsers == 0 {
		hashedAdmin, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		hashedUser1, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
		hashedUser2, _ := bcrypt.GenerateFromPassword([]byte("user223"), bcrypt.DefaultCost)

		users := []models.User{
			{
				Nama:     "Admin KosHub",
				Email:    "admin@koshub.com",
				Password: string(hashedAdmin),
				Role:     "admin",
			},
			{
				Nama:     "User Kesatu",
				Email:    "user1@koshub.com",
				Password: string(hashedUser1),
				Role:     "user",
			},
			{
				Nama:     "User Kedua",
				Email:    "user2@koshub.com",
				Password: string(hashedUser2),
				Role:     "user",
			},
		}

		for _, u := range users {
			db.Create(&u)
		}
		log.Println("Users seeded successfully.")
	} else {
		log.Println("Users table not empty, skipping user seeding.")
	}

	// 2. Seed Products (Kamar Kos)
	var countProducts int64
	db.Model(&models.Product{}).Count(&countProducts)
	if countProducts == 0 {
		products := []models.Product{
			{
				NamaKamar:     "Kamar Deluxe AC A1",
				HargaPerBulan: 1500000,
				Stok:          5,
				Kategori:      "Deluxe",
				Fasilitas:     "AC, Kamar Mandi Dalam, Springbed, Lemari, WiFi, Meja Belajar",
				Deskripsi:     "Kamar tipe deluxe dengan AC dingin, kasur empuk, kamar mandi dalam dengan shower, lemari baju, dan akses WiFi super cepat.",
				Gambar:        "/uploads/deluxe_a1.jpg",
			},
			{
				NamaKamar:     "Kamar Executive B1",
				HargaPerBulan: 2000000,
				Stok:          3,
				Kategori:      "Executive",
				Fasilitas:     "AC, Kamar Mandi Dalam (Water Heater), Springbed King Size, TV, Kulkas Kecil, WiFi",
				Deskripsi:     "Kamar eksekutif dengan fasilitas lengkap termasuk pemanas air, TV layar datar, kulkas mini, dan parkir luas.",
				Gambar:        "/uploads/executive_b1.jpg",
			},
			{
				NamaKamar:     "Kamar Standar Non-AC C1",
				HargaPerBulan: 750000,
				Stok:          10,
				Kategori:      "Standar",
				Fasilitas:     "Kipas Angin, Kamar Mandi Luar, Kasur Busa, Lemari",
				Deskripsi:     "Kamar ekonomis yang bersih dan rapi, menggunakan kipas angin dengan kamar mandi luar yang bersih.",
				Gambar:        "/uploads/standar_c1.jpg",
			},
			{
				NamaKamar:     "Kamar Cozy Mezzanine M1",
				HargaPerBulan: 1800000,
				Stok:          2,
				Kategori:      "Deluxe",
				Fasilitas:     "AC, Kamar Mandi Dalam, Kasur Mezzanine, Sofa Kecil, Lemari, WiFi",
				Deskripsi:     "Desain estetik dengan kasur di area mezzanine atas, memaksimalkan ruang santai di bawah dengan sofa.",
				Gambar:        "/uploads/cozy_m1.jpg",
			},
			{
				NamaKamar:     "Kamar Single AC D1",
				HargaPerBulan: 1100000,
				Stok:          6,
				Kategori:      "Standar",
				Fasilitas:     "AC, Kamar Mandi Dalam, Kasur Single, Lemari, WiFi",
				Deskripsi:     "Cocok untuk mahasiswa/karyawan lajang yang membutuhkan kamar ber-AC dengan harga terjangkau.",
				Gambar:        "/uploads/single_d1.jpg",
			},
			{
				NamaKamar:     "Kamar Family Suite F1",
				HargaPerBulan: 2500000,
				Stok:          4,
				Kategori:      "Suite",
				Fasilitas:     "AC, Kamar Mandi Dalam (Bathup & Water Heater), Kasur King, Dapur Kecil, Ruang Tamu Kecil, TV, WiFi",
				Deskripsi:     "Kamar ukuran ekstra luas dilengkapi dapur mini dan ruang tamu privat, sangat cocok untuk pasangan suami istri baru.",
				Gambar:        "/uploads/suite_f1.jpg",
			},
			{
				NamaKamar:     "Kamar Standar AC E1",
				HargaPerBulan: 1200000,
				Stok:          7,
				Kategori:      "Standar",
				Fasilitas:     "AC, Kamar Mandi Luar, Kasur Queen, Lemari, WiFi",
				Deskripsi:     "Kamar dengan fasilitas AC dan kasur ukuran besar, kamar mandi luar dibersihkan setiap hari.",
				Gambar:        "/uploads/standar_e1.jpg",
			},
			{
				NamaKamar:     "Kamar Minimalis AC G1",
				HargaPerBulan: 1050000,
				Stok:          8,
				Kategori:      "Standar",
				Fasilitas:     "AC, Kamar Mandi Dalam, Kasur Single, Lemari",
				Deskripsi:     "Kamar minimalis hemat tempat namun bersih dan ber-AC lengkap dengan perabotan dasar.",
				Gambar:        "/uploads/minimalis_g1.jpg",
			},
			{
				NamaKamar:     "Kamar VIP Balcony H1",
				HargaPerBulan: 2200000,
				Stok:          3,
				Kategori:      "Executive",
				Fasilitas:     "AC, Kamar Mandi Dalam, Kasur King, Balkon Privat, TV, WiFi",
				Deskripsi:     "Kamar eksekutif dengan balkon pribadi yang menghadap taman belakang, suasana tenang dan asri.",
				Gambar:        "/uploads/balcony_h1.jpg",
			},
			{
				NamaKamar:     "Kamar Hemat Pocket J1",
				HargaPerBulan: 600000,
				Stok:          12,
				Kategori:      "Standar",
				Fasilitas:     "Kipas Angin, Kamar Mandi Luar, Kasur Single, WiFi",
				Deskripsi:     "Kamar kos paling terjangkau dengan sirkulasi udara baik dan fasilitas dasar lengkap.",
				Gambar:        "/uploads/pocket_j1.jpg",
			},
		}

		for _, p := range products {
			db.Create(&p)
		}
		log.Println("Products seeded successfully.")
	} else {
		log.Println("Products table not empty, skipping product seeding.")
	}
}
