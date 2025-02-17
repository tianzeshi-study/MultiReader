import { useState, useCallback } from 'react';

interface UsePageJumperProps {
  totalPages: number;
  onPageChange: (page: number) => void;
}

const usePageJumper = ({ totalPages, onPageChange }: UsePageJumperProps) => {
  const [jumpPage, setJumpPage] = useState<string>('');

  const handleJumpInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setJumpPage(event.target.value);
  }, []);

  const handleJump = useCallback(() => {
    const pageNumber = parseInt(jumpPage, 10);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      onPageChange(pageNumber - 1);
      setJumpPage('');
    } else {
      alert('请输入有效的页码！');
    }
  }, [jumpPage, totalPages, onPageChange]);

  return { jumpPage, handleJumpInputChange, handleJump };
};

export default usePageJumper;
