<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;

class SeedCourses extends Command
{
    protected $signature = 'seed:courses';
    protected $description = 'Seed sample courses and enrollments';

    public function handle()
    {
        $professor = \App\Models\Professor::first();
        if (!$professor) {
            $this->error('Professor record not found');
            return 1;
        }
        $pid = $professor->id;

        $courses = [
            ['title_ar' => 'التحليل الرياضي 1', 'title_fr' => 'Analyse Mathématique 1', 'title_en' => 'Mathematical Analysis 1', 'specialty' => 'Mathématiques', 'level' => 'L1', 'description_ar' => 'النهايات، الاستمرارية، الاشتقاق، التكامل', 'description_fr' => 'Limite, continuité, dérivation, intégration.', 'description_en' => 'Limits, continuity, differentiation, integration.', 'price_dt' => 39, 'status' => 'active', 'professor_id' => $pid],
            ['title_ar' => 'الجبر الخطي', 'title_fr' => 'Algèbre Linéaire', 'title_en' => 'Linear Algebra', 'specialty' => 'Mathématiques', 'level' => 'L1', 'description_ar' => 'الفضاءات المتجهية، التطبيقات الخطية، المصفوفات', 'description_fr' => 'Espaces vectoriels, applications linéaires, matrices.', 'description_en' => 'Vector spaces, linear maps, matrices.', 'price_dt' => 39, 'status' => 'active', 'professor_id' => $pid],
            ['title_ar' => 'الفيزياء العامة 1', 'title_fr' => 'Physique Générale 1', 'title_en' => 'General Physics 1', 'specialty' => 'Physique', 'level' => 'L1', 'description_ar' => 'الميكانيكا، الترموديناميكا، الأمواج', 'description_fr' => 'Mécanique, thermodynamique, ondes.', 'description_en' => 'Mechanics, thermodynamics, waves.', 'price_dt' => 39, 'status' => 'active', 'professor_id' => $pid],
            ['title_ar' => 'مقدمة في البرمجة', 'title_fr' => 'Introduction à la Programmation', 'title_en' => 'Introduction to Programming', 'specialty' => 'Informatique', 'level' => 'L1', 'description_ar' => 'الخوارزميات، هياكل البيانات، C/Python', 'description_fr' => 'Algorithmique, structures de données, C/Python.', 'description_en' => 'Algorithms, data structures, C/Python.', 'price_dt' => 39, 'status' => 'active', 'professor_id' => $pid],
            ['title_ar' => 'التحليل الرياضي 2', 'title_fr' => 'Analyse Mathématique 2', 'title_en' => 'Mathematical Analysis 2', 'specialty' => 'Mathématiques', 'level' => 'L2', 'description_ar' => 'المتتاليات، المسلسلات، التكامل المتعدد', 'description_fr' => 'Suites, séries, intégrale multiple.', 'description_en' => 'Sequences, series, multiple integrals.', 'price_dt' => 39, 'status' => 'active', 'professor_id' => $pid],
            ['title_ar' => 'الاقتصاد العام', 'title_fr' => 'Économie Générale', 'title_en' => 'General Economics', 'specialty' => 'Économie', 'level' => 'L1', 'description_ar' => 'العرض، الطلب، الأسواق، السياسة الاقتصادية', 'description_fr' => 'Offre, demande, marchés, politique économique.', 'description_en' => 'Supply, demand, markets, economic policy.', 'price_dt' => 29, 'status' => 'active', 'professor_id' => $pid],
        ];

        foreach ($courses as $c) {
            Course::firstOrCreate(
                ['title_fr' => $c['title_fr']],
                $c
            );
        }

        // Enroll student (id:3) in first 3 courses
        $student = User::where('email', 'student@edutn.tn')->first();
        if ($student) {
            $courseIds = Course::pluck('id')->take(3);
            foreach ($courseIds as $cid) {
                \Illuminate\Support\Facades\DB::table('enrollments')->insertOrIgnore([
                    'user_id' => $student->id,
                    'course_id' => $cid,
                    'enrolled_at' => now(),
                ]);
            }
            $this->info("Enrolled student in {$courseIds->count()} courses");
        }

        $this->info("Seeded " . Course::count() . " courses total");
        return 0;
    }
}
