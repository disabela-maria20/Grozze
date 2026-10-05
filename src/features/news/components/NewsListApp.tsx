'use client';

import { useState } from 'react';
import { NEWS, unique } from '@/shared/lib/catalog';
import { NewsCard } from './NewsCard';
import { Chip } from '@/shared/ui';

export function NewsListApp() {
  const categories = ['Todos', ...unique(NEWS.map((item) => item.k))];
  const [filter, setFilter] = useState('Todos');
  const list = NEWS.filter((item) => filter === 'Todos' || item.k === filter);

  return (
    <div className="page pt-30 max-sm:pt-25.25 pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] tracking-tighter leading-[1.05] mb-3">
            Notícias
          </h1>
        </header>
        <div className="flex gap-1.5 flex-wrap mb-5">
          {categories.map((category) => (
            <Chip
              key={category}
              active={filter === category}
              onClick={() => setFilter(category)}
            >
              {category}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4.5">
          {list.map((item) => (
            <NewsCard key={item.id} n={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
