'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { reviewService } from '../../lib/firestore';
import { formatDate } from '../../utils/helpers';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getReviews();
      setReviews(data.slice(0, 3));
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section className="bg-[#FFFFFF] py-32" id="reviews">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold mb-6 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight"
          >
            Studio Stories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#64748B] font-light max-w-xl mx-auto"
          >
            Real moments printed for our community.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-[40px] p-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < review.rating
                          ? 'fill-[#0F172A] text-[#0F172A]'
                          : 'fill-[#E2E8F0] text-[#E2E8F0]'
                      }
                    />
                  ))}
                </div>
                <p className="text-[#0F172A] text-[17px] leading-relaxed mb-8 font-normal">
                  "{review.text}"
                </p>
              </div>

              <div className="flex items-center justify-between text-sm pt-6 border-t border-[#E2E8F0]/60">
                <span className="font-semibold text-[#0F172A] font-[family-name:var(--font-outfit)]">{review.name}</span>
                <span className="text-[#64748B] text-[13px]">
                  {review.createdAt ? formatDate(review.createdAt) : ''}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}