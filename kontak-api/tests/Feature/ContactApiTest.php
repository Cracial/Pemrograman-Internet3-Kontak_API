<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Devin',
            'email' => 'devin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'access_token',
                'token_type',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'devin@example.com',
        ]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'devin@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'devin@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure(['access_token']);
    }

    public function test_contacts_route_requires_authentication(): void
    {
        $this->getJson('/api/kontak')
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_contact_with_nested_phones(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/kontak', [
            'nama' => 'Devin',
            'alamat' => 'Denpasar, Bali',
            'tanggal_lahir' => '2005-01-15',
            'phones' => [
                [
                    'jenis' => 'Pribadi',
                    'nomor_telepon' => '081234567890',
                ],
                [
                    'jenis' => 'WhatsApp',
                    'nomor_telepon' => '089876543210',
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.nama', 'Devin')
            ->assertJsonCount(2, 'data.phones');

        $this->assertDatabaseHas('kontak', [
            'nama' => 'Devin',
        ]);

        $this->assertDatabaseHas('kontak_phones', [
            'jenis' => 'WhatsApp',
            'nomor_telepon' => '089876543210',
        ]);
    }

    public function test_authenticated_user_can_delete_contact(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $contactResponse = $this->postJson('/api/kontak', [
            'nama' => 'Kontak Hapus',
            'alamat' => 'Denpasar',
            'tanggal_lahir' => '2005-01-15',
            'phones' => [
                [
                    'jenis' => 'Pribadi',
                    'nomor_telepon' => '081111111111',
                ],
            ],
        ]);

        $contactId = $contactResponse->json('data.id');

        $this->deleteJson("/api/kontak/{$contactId}")
            ->assertOk()
            ->assertJsonPath('message', 'Kontak berhasil dihapus');

        $this->assertDatabaseMissing('kontak', [
            'id' => $contactId,
        ]);
    }
}
