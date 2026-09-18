<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Contact::with('phones');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($request->has('per_page')) {
            $contacts = $query->latest()->paginate((int) $request->query('per_page', 10));
        } else {
            $contacts = $query->latest()->get();
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar kontak berhasil diambil',
            'data'    => $contacts,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'                  => ['required', 'string', 'max:255'],
            'alamat'                => ['required', 'string'],
            'tanggal_lahir'         => ['required', 'date'],
            'phones'                => ['required', 'array', 'min:1'],
            'phones.*.jenis'        => ['required', 'string', 'max:50'],
            'phones.*.nomor_telepon' => ['required', 'string', 'max:30'],
        ]);

        $contact = DB::transaction(function () use ($validated) {
            $contact = Contact::create([
                'nama'          => $validated['nama'],
                'alamat'        => $validated['alamat'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
            ]);

            $contact->phones()->createMany($validated['phones']);

            return $contact->load('phones');
        });

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil ditambahkan',
            'data'    => $contact,
        ], 201);
    }

    public function show(Contact $kontak): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail kontak berhasil diambil',
            'data'    => $kontak->load('phones'),
        ], 200);
    }

    public function update(Request $request, Contact $kontak): JsonResponse
    {
        $validated = $request->validate([
            'nama'                   => ['sometimes', 'required', 'string', 'max:255'],
            'alamat'                 => ['sometimes', 'required', 'string'],
            'tanggal_lahir'          => ['sometimes', 'required', 'date'],
            'phones'                 => ['sometimes', 'array', 'min:1'],
            'phones.*.jenis'         => ['required_with:phones', 'string', 'max:50'],
            'phones.*.nomor_telepon'  => ['required_with:phones', 'string', 'max:30'],
        ]);

        DB::transaction(function () use ($validated, $kontak) {
            $contactData = collect($validated)
                ->only(['nama', 'alamat', 'tanggal_lahir'])
                ->all();

            if ($contactData !== []) {
                $kontak->update($contactData);
            }

            if (array_key_exists('phones', $validated)) {
                $kontak->phones()->delete();
                $kontak->phones()->createMany($validated['phones']);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil diperbarui',
            'data'    => $kontak->fresh('phones'),
        ], 200);
    }

    public function destroy(Contact $kontak): JsonResponse
    {
        $kontak->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil dihapus',
        ], 200);
    }
}