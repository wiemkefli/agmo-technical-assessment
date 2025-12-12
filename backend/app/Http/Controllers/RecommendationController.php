<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Models\Job;
use App\Services\JobSearchService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(protected JobSearchService $jobSearchService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_remote' => ['nullable', 'boolean'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'salary_currency' => ['nullable', 'string', 'size:3'],
            'salary_period' => ['nullable', 'string', 'in:month,year'],
            'sort' => ['nullable', 'string', 'in:newest,oldest'],
        ]);

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $user = $request->user();
        $savedIds = $user->savedJobs()->pluck('jobs.id')->all();

        $query = Job::query()
            ->where('status', 'published')
            ->whereNotIn('id', $savedIds);

        $this->jobSearchService->applyFilters($query, $filters);

        $keywords = $this->extractKeywords($user->savedJobs()->pluck('jobs.title')->all());
        $this->applyKeywordScoring($query, $keywords);

        $sort = $filters['sort'] ?? 'newest';
        if ($sort === 'oldest') {
            $query->orderBy('published_at')->orderBy('id');
        } else {
            $query->orderByDesc('published_at')->orderByDesc('id');
        }

        $jobs = $query->paginate($perPage);

        return new JobCollection($jobs);
    }

    protected function extractKeywords(array $titles): array
    {
        $stop = [
            'and', 'or', 'the', 'a', 'an', 'to', 'of', 'for', 'in', 'on', 'with', 'at', 'by',
            'jr', 'junior', 'sr', 'senior', 'lead', 'ii', 'iii',
        ];

        $bag = [];

        foreach ($titles as $title) {
            $tokens = preg_split('/[^a-z0-9]+/i', strtolower((string) $title)) ?: [];
            foreach ($tokens as $token) {
                $token = trim($token);
                if ($token === '' || strlen($token) < 3) {
                    continue;
                }
                if (in_array($token, $stop, true)) {
                    continue;
                }
                $bag[$token] = ($bag[$token] ?? 0) + 1;
            }
        }

        arsort($bag);

        return array_slice(array_keys($bag), 0, 10);
    }

    protected function applyKeywordScoring(Builder $query, array $keywords): void
    {
        if (count($keywords) === 0) {
            return;
        }

        $cases = [];
        $bindings = [];

        foreach ($keywords as $kw) {
            $like = "%{$kw}%";
            $cases[] = 'CASE WHEN title LIKE ? THEN 3 ELSE 0 END';
            $bindings[] = $like;
            $cases[] = 'CASE WHEN description LIKE ? THEN 1 ELSE 0 END';
            $bindings[] = $like;
            $cases[] = 'CASE WHEN location LIKE ? THEN 1 ELSE 0 END';
            $bindings[] = $like;
        }

        $scoreSql = implode(' + ', $cases);
        $query->select('jobs.*')->selectRaw("({$scoreSql}) as relevance_score", $bindings);
        $query->orderByDesc('relevance_score');
    }
}

