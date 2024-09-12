import requests
from django.db.models import Avg, Count, Q, Sum, F, FloatField,Value,CharField
from django.db.models.functions import ExtractYear, Round, Cast, Concat
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser,JSONParser
from rest_framework.response import Response
from theses.utils import *
from theses.export_pdf import export_pdf
from theses.models import *
from theses.serializers import *
from theses import serializers, pagination, my_permission, send_mail
from django.conf.global_settings import DATE_FORMAT
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ObjectDoesNotExist

class BaseSearchViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = None
    serializer_class = None
    parser_classes = [MultiPartParser, ]  # Nhận dữ liệu là file

    def get_queryset(self):
        queryset = self.queryset
        kw = self.request.query_params.get('kw')
        if kw:
            queryset = queryset.annotate(
                full_name=Concat(F('last_name'), Value(' '), F('first_name'), output_field=CharField())
            ).filter(full_name__icontains=kw)
        return queryset

class UserViewSet(BaseSearchViewSet):
    queryset = NguoiDung.objects.filter(is_active=True)
    serializer_class = NguoiDungSerializer
    parser_classes = [MultiPartParser,JSONParser]  # nhận dữ liệu là file

    def get_permissions(self):
        if self.action in ["get_current_user"]:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=["patch"],url_path='change-password', detail=False)
    def change_password(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        # Lấy người dùng hiện tại
        user = request.user

        # Kiểm tra mật khẩu hiện tại
        if not check_password(current_password, user.password):
            return Response({"error": "Mật khẩu hiện tại không chính xác."}, status=status.HTTP_400_BAD_REQUEST)

        # Cập nhật mật khẩu mới
        user.set_password(new_password)
        user.save()

        return Response({"message": "Mật khẩu đã được thay đổi thành công."}, status=status.HTTP_200_OK)

    @action(methods=["patch"], url_path="change-avatar", detail=False)
    def change_avatar(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response({'error': 'Vui lòng cung cấp ảnh mới'}, status=status.HTTP_400_BAD_REQUEST)

        # Xóa avatar cũ nếu có
        if user.avatar:
            user.avatar.delete(save=False)

        # Lưu avatar mới
        user.avatar = avatar
        user.save()

        # Trả về phản hồi xác nhận với URL mới của avatar
        avatar_url = request.build_absolute_uri(user.avatar.url)
        return Response({'avatar': avatar_url}, status=status.HTTP_200_OK)

    @action(methods=["get", "patch"], url_path="current-user", detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__("patch"):
            for k, v in request.data.items():
                setattr(user, k, v)
                user.save()

        return Response(serializers.NguoiDungDetailSerializer(user,context={'request':request}).data)


class SinhVienViewSet(BaseSearchViewSet):
    queryset = SinhVien.objects.filter(is_active=True)
    serializer_class = SinhVienSerializer
    parser_classes = [MultiPartParser, ]  # Nhận dữ liệu là file
    pagination_class = pagination.GiangVienPaginator

    def get_permissions(self):
        if self.action in ["get_current_user"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=["get", "patch"], url_path="current-user", detail=False)
    def get_current_user(self, request):
        user = request.user

        if request.method.__eq__("patch"):
            for k, v in request.data.items():
                setattr(user, k, v)
                user.save()
        sinh_vien = SinhVien.objects.get(pk=user.pk)
        return Response(serializers.SinhVienDetailSerializer(sinh_vien,context={'request':request}).data)


    def get_queryset(self):
        queryset = self.queryset
        sinh_vien_name = self.request.query_params.get("sinh_vien", None)

        if sinh_vien_name:
            # Split the giang_vien_name by the first space
            name_parts = sinh_vien_name.split(" ", 1)

            # Extract the first name and last name
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            # Filter the queryset using the extracted first and last names
            queryset = queryset.filter(
                Q(first_name__icontains=first_name) & Q(last_name__icontains=last_name)
            ).distinct()

        return queryset


class GiangVienViewSet(BaseSearchViewSet):
    queryset = GiangVien.objects.filter(is_active=True)
    serializer_class = GiangVienSerializer
    parser_classes = [MultiPartParser, ]  # nhận dữ liệu là file
    pagination_class = pagination.GiangVienPaginator

    def get_queryset(self):
        queryset = self.queryset
        giang_vien_name = self.request.query_params.get("giang_vien", None)

        if giang_vien_name:
            # Split the giang_vien_name by the first space
            name_parts = giang_vien_name.split(" ", 1)

            # Extract the first name and last name
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            # Filter the queryset using the extracted first and last names
            queryset = queryset.filter(
                Q(first_name__icontains=first_name) & Q(last_name__icontains=last_name)
            ).distinct()

        return queryset

    def get_permissions(self):
        if self.action in ["get_current_user"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=["get", "patch"], url_path="current-user", detail=False)
    def get_current_user(self, request):
        user = request.user

        if request.method.__eq__("patch"):
            for k, v in request.data.items():
                setattr(user, k, v)
                user.save()
        giang_vien = GiangVien.objects.get(pk=user.pk)
        return Response(serializers.GiangVienDetailSerializer(giang_vien,context={'request':request}).data)

    @action(methods=["get"], url_path="kltn",detail=True) # có sửa false thành true
    def get_kltn(self, request, **kwargs):
        pk = kwargs.get("pk")
        q = KhoaLuanTotNghiep.objects.filter(
            Q(hdbvkl__chu_tich_id=pk) |
            Q(hdbvkl__thu_ky_id=pk) |
            Q(hdbvkl__gv_phan_bien_id=pk) |
            Q(hdbvkl__thanh_vien__id=pk)
        ).distinct()  # Thêm distinct() để tránh trùng lặp kết quả nếu có nhiều quan hệ
        #tìm kiếm
        kw = self.request.query_params.get('kw')
        if kw:
            q = q.filter(ten_khoa_luan__icontains=kw)
        #đè lại pagination
        page = self.paginate_queryset(q)
        if page is not None:
            serializer = KLTNGiangVienSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = KLTNGiangVienSerializer(q, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GiaoVuViewSet(BaseSearchViewSet):
    queryset = GiaoVu.objects.filter(is_active=True)
    serializer_class = GiaoVuSerializer
    parser_classes = [MultiPartParser, ]  # nhận dữ liệu là file

    def get_permissions(self):
        if self.action in ["get_current_user"]:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=["get", "patch"], url_path="current-user", detail=False)
    def get_current_user(self, request):
        user = request.user

        if request.method.__eq__("patch"):
            for k, v in request.data.items():
                setattr(user, k, v)
                user.save()
        giao_vu = GiaoVu.objects.get(pk=user.pk)
        return Response(serializers.GiaoVuDetailSerializer(giao_vu,context={'request':request}).data)

class KLTNViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView,generics.CreateAPIView):
    queryset = KhoaLuanTotNghiep.objects.all().order_by('-created_date')  # filter(trang_thai=True)
    serializer_class = KLTNSerializer
    pagination_class = pagination.KLTNPaginator
    permission_classes = [my_permission.SinhVienPermissionUser]
    def get_permissions(self):
        if self.action == 'get_diem':
            return [my_permission.GiangVienPermissionUser()]
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.AllowAny()]
    def get_queryset(self):
        queryset = self.queryset
        hdbvkl = self.request.query_params.get('hdbvkl')
        ten_khoa_luan = self.request.query_params.get('ten_khoa_luan')

        if hdbvkl:
             queryset = queryset.filter(hdbvkl=hdbvkl)
        if ten_khoa_luan:
            queryset = queryset.filter(ten_khoa_luan__icontains=ten_khoa_luan)

        pk = self.request.query_params.get('lec_id')
        if pk:
            queryset = queryset.filter(
                Q(hdbvkl__chu_tich_id=pk) |
                Q(hdbvkl__thu_ky_id=pk) |
                Q(hdbvkl__gv_phan_bien_id=pk) |
                Q(hdbvkl__thanh_vien__id=pk)
            ).distinct()

        pk = self.request.query_params.get('stu_id')
        if pk:
            queryset = queryset.filter(mssv__pk=pk).distinct()

        return queryset
    @action(methods=["patch"], detail=True)
    def change_thesis_status(self, request, *args, **kwargs):
        kltn = self.get_object()
        new_status = request.data.get("trang_thai", None)

        if isinstance(new_status, str):
            new_status = new_status.lower() == 'true'

        if new_status is not None:
            kltn.trang_thai = new_status

            if not new_status:
                # auth_header = request.headers.get('Authorization')
                # token = auth_header.split(' ')[1] if auth_header else None
                # headers = {'Authorization': f'Bearer {token}'}

                # scores_api = requests.get(f'{settings.BASE_URL}/Diem/{kwargs.get("pk")}/get_avg_score/', headers=headers)

                kltn.diem_tong = calculate_average_score(kwargs.get("pk")) # scores_api.json().get("avg_score")
                kltn.save()

                data = self.get_serializer(kltn).data
                print(data)
                send_mail.send_mail_for_thesis(data)
                return Response({
                    "data": data,
                })

            kltn.save()
            data = self.get_serializer(kltn).data

            return Response(data)
        else:
            return Response({'error': 'New status not provided'}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["get"], url_path="avg_score", detail=False)
    def get_avg_score(self, request):
        year = request.GET.get('year', None)
        years = KhoaLuanTotNghiep.objects.values_list("created_date__year", flat=True).distinct()

        average_scores = (KhoaLuanTotNghiep.objects
                          .filter(diem_tong__isnull=False)
                          .values("id", "ten_khoa_luan", "diem_tong", "created_date", "created_date__year", "created_date__month", "created_date__day"))

        if year:
            average_scores = average_scores.filter(created_date__year=year)
            context = {
                "average_scores": average_scores,
                "years": years,
                "request_year": int(year),
            }
        else:
            context = {
                "average_scores": average_scores,
                "years": years,
                "request_year": None,
            }

            return Response(context)
        # queryset = self.queryset
        #
        # year = self.request.query_params.get("year")
        # if year:
        #     queryset = queryset.filter(created_date__year=year)
        #
        # faculty = self.request.query_params.get("fac")
        # if faculty:
        #     queryset = queryset.filter(sinh_vien__nganh=faculty)
        #
        # avg_score = queryset.aggregate(Avg("diem"))
        #
        # return Response({"avg_score": avg_score["diem__avg"]})

    @action(methods=["get"], url_path="frequency", detail=False)
    def get_frequency(self, request):
        faculties = NganhHoc.objects.all()

        freq_stats = (NganhHoc.objects.annotate(
            freq=Count("lop__sinhvien__khoaluantotnghiep"),
        ).values("id", "ten_nganh", "created_date", "freq"))

        faculties_serialized = NganhHocSerializer(faculties, many=True).data

        context = {
            "freq_stats": freq_stats,
            "faculties": faculties_serialized,
        }

        return Response(context)

    @action(methods=['post'], url_path='add', detail=False)
    def add_KLTN(self, request):
        # lấy danh sách cách mssv gửi trên body
        sinh_vien_list = request.data.get('mssv', [])

        if len(sinh_vien_list) == 0:
            return Response({"error": "Phải có ít nhất một sinh viên mới được tạo"}, status.HTTP_400_BAD_REQUEST)

        ten_khoa_luan = request.data.get("ten_khoa_luan")
        ty_le_dao_van = request.data.get("ty_le_dao_van")
        diem_tong = request.data.get("diem_tong")
        c = KhoaLuanTotNghiep.objects.create(ten_khoa_luan=ten_khoa_luan, ty_le_dao_van=ty_le_dao_van,
                                             diem_tong=diem_tong)

        # thêm từng sinh viên vào KLTN
        for mssv in sinh_vien_list:
            if not SinhVien.objects.filter(pk=mssv.get('mssv')).exists():
                return Response({"error": f"Sinh viên với mã số sinh viên: {mssv.get('mssv')} không tồn tại."},
                                status=status.HTTP_400_BAD_REQUEST)
            sinhVien = SinhVien.objects.get(pk=mssv.get('mssv'))
            c.mssv.add(sinhVien)
        return Response(serializers.KLTNSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=["patch"], url_path="add_hdbvkl", detail=True)
    def add_HDBVKL(self, request, pk=None):
        hdbvkl_id = request.data.get("hdbvkl")

        if hdbvkl_id is None:
            return Response("Vui lòng cung cấp ID của hội đồng bảo vệ khóa luận", status=status.HTTP_400_BAD_REQUEST)

        try:
            hdbvkl = HoiDongBVKL.objects.get(pk=hdbvkl_id)
        except HoiDongBVKL.DoesNotExist:
            return Response("Hội đồng bảo vệ khóa luận không tồn tại", status=status.HTTP_404_NOT_FOUND)

        if hdbvkl.khoaluantotnghiep_set.count() >= 5:
            return Response("Hội đồng bảo vệ khóa luận đã chấm tối đa 5 khóa luận tốt nghiệp",
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            kltn = KhoaLuanTotNghiep.objects.get(pk=pk)
        except KhoaLuanTotNghiep.DoesNotExist:
            return Response("Khóa luận tốt nghiệp không tồn tại", status=status.HTTP_404_NOT_FOUND)

        kltn.hdbvkl = hdbvkl
        kltn.save()
        response_data = {
            "message": "Thêm thành công",
            "kltn": {
                "id": kltn.id,
                "ten_khoa_luan": kltn.ten_khoa_luan,
                "diem_tong": kltn.diem_tong,
                "hdbvkl": {
                    "id": hdbvkl.id
                }
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add_gvhd', detail=True)
    def add_GiangVienHuongDan(self, request, pk):
        try:
            khoaluan = KhoaLuanTotNghiep.objects.get(id=pk)
        except KhoaLuanTotNghiep.DoesNotExist:
            return Response({"error": "Không tìm thấy khóa luận tốt nghiệp"}, status=status.HTTP_404_NOT_FOUND)

        kltngv_huong_dan = khoaluan.kltngvhuongdan_set.first()
        if kltngv_huong_dan is None:
            kltngv_huong_dan = KLTNGVHuongDan.objects.create(kltn=khoaluan)

        c = kltngv_huong_dan.gv_huong_dan.count()
        gv_huong_dan_list = request.data.get("gv_huong_dan", [])

        if ((c + len(gv_huong_dan_list))> 2) :
            return Response({"error": "Số lượng giảng viên hướng dẫn đã đạt tối đa"},
                            status=status.HTTP_400_BAD_REQUEST)

        for id in gv_huong_dan_list:
            gv_id = id.get("id")
            if not GiangVien.objects.filter(id=gv_id).exists():
                return Response({"error": f"Giảng viên có id: {gv_id} không tồn tại!"},
                                status=status.HTTP_400_BAD_REQUEST)

            gv = GiangVien.objects.get(id=gv_id)
            kltngv_huong_dan.gv_huong_dan.add(gv)
            message = f"Bạn đã được thêm vào làm giảng viên hướng dẫn cho \nKhóa luận tốt nghiệp: {khoaluan.ten_khoa_luan}\n ID: {khoaluan.id}\nVui lòng lên APP để kiểm tra thông tin chi tiết hơn!"
            recipient_email = gv.email
            send_custom_email(message,recipient_email)

        return Response("Thêm thành công", status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path="add_tieu_chi_vao_kltn", detail=True)
    def add_tieuchi(self, request, pk=None):
        if KhoaLuanTotNghiep.objects.filter(pk=pk).exists():
            kltn = KhoaLuanTotNghiep.objects.get(pk=pk)
            tieuchi_list = request.data.get('tieu_chi', [])

            # Calculate the current total ratio of criteria associated with KLTN
            current_total_tyle = sum(tieuchi.ty_le for tieuchi in kltn.tieu_chi.all())

            # Calculate the total ratio of the new criteria to be added
            new_total_tyle = 0
            for tieuchi_id in tieuchi_list:
                if TieuChi.objects.filter(pk=tieuchi_id).exists():
                    tieuchi = TieuChi.objects.get(pk=tieuchi_id)
                    new_total_tyle += tieuchi.ty_le
                else:
                    return Response(
                        {"error": f"Không tồn tại tiêu chí có id là: {tieuchi_id}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Check if the combined ratio is equal to 1
            if current_total_tyle + new_total_tyle != 100:
                return Response(
                    {"error": "Tổng tỷ lệ của các tiêu chí phải bằng 100"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # If total ratio is 1, add criteria to KLTN
            for tieuchi_id in tieuchi_list:
                tieuchi = TieuChi.objects.get(pk=tieuchi_id)
                kltn.tieu_chi.add(tieuchi)

            return Response("Thêm thành công", status=status.HTTP_201_CREATED)
        else:
            return Response(
                {"error": f"Không tồn tại Khóa luận tốt nghiệp có id là: {pk}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(methods=['get'], url_path="diem", detail=True)
    def get_diem(self, request, pk):
        try:
            giang_vien = GiangVien.objects.get(pk=request.user.id)
            kltn = KhoaLuanTotNghiep.objects.get(pk=pk)
        except GiangVien.DoesNotExist:
            return Response({"detail": "Giảng viên không tồn tại"}, status=404)
        except KhoaLuanTotNghiep.DoesNotExist:
            return Response({"detail": "Khóa luận tốt nghiệp không tồn tại"}, status=404)

        diem_queryset = Diem.objects.filter(gv=giang_vien, kltn=kltn).select_related('tieu_chi')
        serializer = DiemGiangVien(diem_queryset, many=True)

        # Lấy hết tiêu chí của khóa luận
        all_tieu_chis = kltn.tieu_chi.all()
        # Lấy tất cả các tiêu chí đã có điểm
        existing_tieu_chis = [diem.tieu_chi for diem in diem_queryset]
        # Lấy tiêu chí chưa có điểm và tạo missing_data
        missing_data = []
        for tieu_chi in all_tieu_chis:
            if tieu_chi not in existing_tieu_chis:
                missing_data.append({
                    'id':0,
                    'tieu_chi': {
                        'id': tieu_chi.id,
                        'tieu_chi': tieu_chi.tieu_chi,
                        'ty_le': tieu_chi.ty_le
                    },
                    'diem': 'Chưa có'
                })

        existing_data = serializer.data
        response_data = existing_data + missing_data
        return Response(response_data)

class HDBVKLViewSet(viewsets.ViewSet,generics.ListAPIView,generics.UpdateAPIView,generics.CreateAPIView):
    queryset = HoiDongBVKL.objects.all().order_by('-created_date')
    serializer_class = HDBVKLSerializer
    pagination_class = pagination.HDBVKLPaginator
    #permission_classes = [my_permission.GiaoVuPermissionUser]

    def get_queryset(self):
        queryset = self.queryset
        trang_thai = self.request.query_params.get('trang_thai', None)
        giang_vien = self.request.query_params.get("giang_vien", None)
        kltn = self.request.query_params.get('kltn')
        if kltn:
            queryset = queryset.annotate(num_kltn=Count('khoaluantotnghiep')).filter(num_kltn=kltn)
        if trang_thai is not None:
            queryset = queryset.filter(trang_thai=trang_thai)

        if giang_vien:
            queryset = queryset.filter(
                Q(chu_tich=giang_vien) |
                Q(thu_ky=giang_vien) |
                Q(thanh_vien__in=[giang_vien])
            ).distinct()

        return queryset

    @action(methods=["get"], detail=True)
    def get_hdbvkl(self, request, **kwargs):
        # send_mail.send_mail_for_thesis(queryset)

        pk = kwargs.get("pk")
        hdbvkl = self.queryset.get(pk=pk)
        serializer = self.get_serializer(hdbvkl)

        # send_mail.send_mail_for_thesis(serializer.data)

        return Response(serializer.data)

    @action(methods=["post"], url_path='add', detail=False)
    def add_hdbvkl(self, request):
        gv_phanbien = GiangVien.objects.get(id=request.data.get("gv_phan_bien"))
        chu_tich = GiangVien.objects.get(id=request.data.get("chu_tich"))
        thu_ky = GiangVien.objects.get(id=request.data.get("thu_ky"))
        ngay_bao_ve = request.data.get("ngay_bao_ve")
        thanh_vien_list = request.data.get("thanh_vien", [])

        if len(thanh_vien_list) <= 2:
            hd = HoiDongBVKL.objects.create(gv_phan_bien=gv_phanbien, chu_tich=chu_tich, thu_ky=thu_ky,
                                            ngay_bao_ve=ngay_bao_ve)
            for thanh_vien_id in thanh_vien_list:
                if GiangVien.objects.filter(pk=thanh_vien_id).exists():
                    thanh_vien = GiangVien.objects.get(pk=thanh_vien_id)
                    hd.thanh_vien.add(thanh_vien)
                else:
                    return Response({"error": f"Thành viên có id {thanh_vien_id} không tồn tại"},
                                    status=status.HTTP_400_BAD_REQUEST)
            serializer = HDBVKLSerializer(hd)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Số lượng thành viên không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["patch"], url_path="trang_thai_hdbvkl", detail=True)
    def khoa_hdbvkl(self, request, pk):
        try:
            hdbvkl = HoiDongBVKL.objects.get(pk=pk)
            # Đảo ngược giá trị hiện tại của trang_thai
            hdbvkl.trang_thai = not hdbvkl.trang_thai
            hdbvkl.save()
            return Response({"message": "Cập nhật trạng thái thành công", "trang_thai": hdbvkl.trang_thai},
                            status=status.HTTP_200_OK)
        except HoiDongBVKL.DoesNotExist:
            return Response({"error": "Hội đồng bảo vệ khóa luận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)


class TieuChiViewSet(viewsets.ViewSet,generics.ListAPIView,generics.CreateAPIView):
    queryset = TieuChi.objects.all().order_by('-created_date')
    serializer_class = TieuChiSerializer
    pagination_class = pagination.TieuChiPaginator
    # permission_classes = [my_permission.GiaoVuPermissionUser]
    def get_queryset(self):
        queryset = self.queryset
        kw = self.request.query_params.get('kw')
        if kw:
            queryset = queryset.filter(tieu_chi__icontains=kw)
        return queryset


class DiemViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,generics.CreateAPIView,generics.UpdateAPIView):
    queryset = Diem.objects.all()
    serializer_class = DiemSerializer
    permission_classes = [my_permission.SinhVienPermissionUser]

    @action(methods=["get"], detail=True)
    def get_thesis_scores(self, request, **kwargs):
        queryset = Diem.objects.filter(kltn=kwargs.get("pk"))
        data = self.get_serializer(queryset, many=True).data

        return Response(data)

    @action(methods=["get"], detail=True)
    def export_pdf(self, request, **kwargs):
        queryset = Diem.objects.filter(kltn=kwargs.get("pk"))
        # thesis_name = KhoaLuanTotNghiep.objects.filter(id=kwargs.get("pk")).first().ten_khoa_luan
        thesis_name = KhoaLuanTotNghiep.objects.filter(id=kwargs.get("pk")).first().ten_khoa_luan
        data = self.get_serializer(queryset, many=True).data
        if request.user.is_authenticated:
            export_pdf(data, thesis_name, [request.user.email, "2151050191khanh@ou.edu.vn"])
        else:
            export_pdf(data, thesis_name, ["2151050191khanh@ou.edu.vn"])

        return Response(f"Export successfully to {request.user.email if request.user.is_authenticated else request.user}!", status.HTTP_200_OK)

    @action(methods=["get"], detail=True)
    def calculate_current_score(self, request, **kwargs):
        print(calculate_average_score(kwargs.get("pk")))
        return Response(calculate_average_score(kwargs.get("pk")))

    # @action(methods=["get"], detail=True)
    # def get_avg_score(self, request, **kwargs):
    #     # queryset = Diem.objects.filter(kltn=kwargs.get("pk"))
    #     # avg_score = queryset.aggregate(Avg("diem"))
    #
    #     average_scores = (KhoaLuanTotNghiep.objects.filter(id=kwargs.get("pk"))
    #                       .annotate(
    #         average_score=Round(
    #             Sum(Cast(F('diem__diem') * F('diem__tieu_chi__ty_le') / 100, FloatField())) / Count('diem__gv',
    #                                                                                                 distinct=True), 2)
    #     ).values("average_score"))
    #     # print(average_scores)
    #     return Response({
    #         "avg_score": average_scores[0]["average_score"]
    #     })

    # @action(methods=["patch"], detail=True)
    # def change_thesis_score(self, request, **kwargs):
    #     # request: diem, tieu chi, lec
    #     diem = self.get_object(kltn=kwargs.get("pk"))
    @action(methods=["post"], url_path="add", detail=False)
    def add_diem(self, request):
        # Lấy dữ liệu từ request
        kltn_id = request.data.get('kltn')
        diem = request.data.get('diem')
        tieuchi_id = request.data.get("tieuchi")
        giangvien = request.user.id

        try:
            # Lấy đối tượng KhoaLuanTotNghiep từ ID
            kltn = KhoaLuanTotNghiep.objects.get(pk=kltn_id)
            if kltn.hdbvkl.trang_thai == False:
                return Response({"error": "Hội đồng đã bị khóa nên không thể sửa điểm"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Lấy hội đồng bảo vệ khóa luận liên quan đến KhoaLuanTotNghiep này
            hdbvkl = kltn.hdbvkl

            ## lấy giảng viên đang thêm điểm vào
            giangvien = GiangVien.objects.get(pk=giangvien)

            if not check_giang_vien_in_hdbv_kltn(giangvien=giangvien, kltn=kltn):
                return Response({"error": "Bạn không nằm trong hội đồng bảo vệ khóa luận này"},
                                status=status.HTTP_400_BAD_REQUEST)

            tieuchi = kltn.tieu_chi.get(pk=tieuchi_id)
            if not check_tieu_chi_in_kltn(tieuchi=tieuchi, kltn=kltn):
                return Response({"error": "Tiêu chí không nằm trong khóa luận tốt nghiệp này"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Tạo và lưu đối tượng Diem
            Diem.objects.create(
                tieu_chi=tieuchi,
                diem=diem,
                gv=giangvien,
                kltn=kltn
            )
            # cập nhật điểm Tong
            kltn.diem_tong = calculate_diem_tong(kltn)
            kltn.save()
            # Ghi lại hành động vào ActionLog
            ActionLog.objects.create(
                user=giangvien,
                action=f"Thêm điểm cho tiêu chí {tieuchi_id} của khóa luận {kltn_id}"
            )
            return Response("Thêm điểm thành công", status=status.HTTP_201_CREATED)

        except KhoaLuanTotNghiep.DoesNotExist:
            return Response({"error": "Không tìm thấy khóa luận tốt nghiệp"}, status=status.HTTP_404_NOT_FOUND)
        except TieuChi.DoesNotExist:
            return Response({"error": "Không tìm thấy tiêu chí"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["patch"], url_path="update", detail=True)
    def update_diem(self, request, pk):
        diem_id = pk  # Sử dụng pk từ URL để xác định điểm cần sửa
        new_diem_value = request.data.get('diem')
        giangvien_id = request.user.id  # Lấy ID của giảng viên đang đăng nhập

        # Kiểm tra xem dữ liệu có đầy đủ không
        if new_diem_value is None:
            return Response({"error": "Dữ liệu không đầy đủ"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Lấy đối tượng Diem từ ID
            diem_obj = Diem.objects.get(pk=diem_id)

            # Kiểm tra xem giảng viên hiện tại có phải là người đã thêm điểm trước đó không
            if diem_obj.gv.id != giangvien_id:
                return Response({"error": "Bạn chỉ có thể sửa điểm của chính mình"}, status=status.HTTP_403_FORBIDDEN)

            # Lấy đối tượng KhoaLuanTotNghiep từ Diem
            kltn = diem_obj.kltn
            if kltn.hdbvkl.trang_thai==False:
                return Response({"error": "Hội đồng đã bị khóa nên không thể sửa điểm"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Cập nhật giá trị điểm mới
            old_diem_value = diem_obj.diem
            diem_obj.diem = new_diem_value
            diem_obj.save()

            # Ghi lại hành động vào ActionLog
            giangvien = request.user
            ActionLog.objects.create(
                user=giangvien,
                action=f"Sửa điểm cho tiêu chí {diem_obj.tieu_chi.id} của khóa luận {kltn.id} từ {old_diem_value} thành {new_diem_value}"
            )
            # Cập nhật điểm tổng của KhoaLuanTotNghiep
            calculate_diem_tong(kltn)

            return Response({
                "message": "Sửa điểm thành công",
                "diem": {
                    "id": diem_obj.id,
                    "new_diem_value": new_diem_value,
                    "kltn": kltn.trang_thai,
                    "tieu_chi": diem_obj.tieu_chi.tieu_chi,
                    "old_diem_value": old_diem_value
                }
            }, status=status.HTTP_200_OK)

        except Diem.DoesNotExist:
            return Response({"error": "Không tìm thấy điểm"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def calculate_average_score(pk):
    average_scores = (KhoaLuanTotNghiep.objects.filter(id=pk)
                      .annotate(
        average_score=Round(
            Sum(Cast(F('diem__diem') * F('diem__tieu_chi__ty_le') / 100, FloatField())) / Count('diem__gv',
                                                                                                distinct=True), 2)
    ).values("average_score"))
    # print(average_scores)
    return average_scores[0]["average_score"]


class KLTNDetailsViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = KhoaLuanTotNghiep.objects.all()
    serializer_class = KLTNDetailsSerializer
    permission_classes = [my_permission.SinhVienPermissionUser]
    # print("KLTN permission_classes", permission_classes)
    @action(methods=["get"], detail=True)
    def get_thesis_details(self, request, **kwargs):
        queryset = KhoaLuanTotNghiep.objects.filter(id=kwargs.get("pk")).first()
        data = self.get_serializer(queryset).data

        return Response(data)

class EmailConfirmViewSet(viewsets.ViewSet,generics.CreateAPIView):
    queryset = EmailConfirm.objects.all()
    serializer_class = EmailConfirmSerializer
    @action(methods=['post'],url_path='get_email',detail=False)
    def create_email_confirm(self,request):
        email = request.data.get('email',None)
        validated_time_minutes = 3
        if email is not None:
            ma_xac_nhan = generate_verification_code()
            if NguoiDung.objects.filter(email=email).exists():
                #lấy user
                user = NguoiDung.objects.filter(email=email).first()
                try:
                    new_email_confirm = user.emailconfirm
                    if is_updated_date_within_minutes(new_email_confirm.updated_date, validated_time_minutes) and new_email_confirm.trang_thai==True:
                        return Response({"error": f"Mã xác nhận đã được gửi vui lòng đợi {validated_time_minutes} phút để lấy mã mới"},status=status.HTTP_429_TOO_MANY_REQUESTS)
                    new_email_confirm.ma_xac_nhan = ma_xac_nhan
                    new_email_confirm.trang_thai = True
                    new_email_confirm.save()
                except ObjectDoesNotExist:
                    EmailConfirm.objects.create(nguoidung=user,ma_xac_nhan=ma_xac_nhan,trang_thai=True)
                send_custom_email(f"Mã xác nhận của bạn là: {ma_xac_nhan}\nMã xác nhận có hiệu lực trong 3 phút!",email)
                return Response({"message":"Gửi mã xác nhận thành công"},status=status.HTTP_200_OK)
            else:
                return Response({"error": "Không tồn tại người dùng này"},status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error":"email không được để trống"},status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'],url_path='validate_email_to_change_password', detail=False)
    def change_password(self, request):
        email = request.data.get('email',None)
        ma_xac_nhan = request.data.get('ma_xac_nhan',None)
        new_password = request.data.get('new_password',None)
        if email is None:
            return Response({"error": "email không được để trống"},status=status.HTTP_400_BAD_REQUEST)
        if ma_xac_nhan is None:
            return Response({"error": "mã xác nhận không được để trống"},status=status.HTTP_400_BAD_REQUEST)
        if new_password is None:
            return Response({"error": "password không được để trống"},status=status.HTTP_400_BAD_REQUEST)
        #số phút có thể được nhập mã xác thực
        validated_time_minutes = 3
        # lấy user
        user = NguoiDung.objects.filter(email=email).first()
        new_email_confirm = user.emailconfirm
        #kiểm tra xem thời gian hiệu lực để nhập mã xác nhận có ok không
        if not is_updated_date_within_minutes(new_email_confirm.updated_date,validated_time_minutes):
            return Response({"error": "Mã xác nhận hết hiệu lực"},status=status.HTTP_400_BAD_REQUEST)
        #kiểm tra mã xác nhận có đúng không và kiểm tra người dùng có kích hoạt lấy lại email
        if new_email_confirm.ma_xac_nhan == ma_xac_nhan and new_email_confirm.trang_thai:
            user.set_password(new_password)
            user.save()
            new_email_confirm.trang_thai=False
            new_email_confirm.save()
            return Response({"message": "Đổi mật khẩu thành công"},status=status.HTTP_200_OK)
        else:
            return Response({"error": "Mã xác nhận không chính xác"},status=status.HTTP_400_BAD_REQUEST)
