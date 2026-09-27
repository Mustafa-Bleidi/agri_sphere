<?php

namespace Tests\Unit;

use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_twice_does_not_throw_and_does_not_duplicate_roles(): void
    {
        // Regression test: the production Docker image re-runs this seeder on
        // every boot (it has no other way to guarantee the roles a fresh
        // database needs before the app can register or log in a user), so
        // it must survive being run against a database that already has the
        // roles from a previous boot.
        $this->seed(RoleSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->assertSame(5, Role::count());
        $this->assertTrue(Role::where('name', 'farmer')->exists());
    }
}
